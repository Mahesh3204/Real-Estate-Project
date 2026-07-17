using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Infrastructure.Data;
using StackExchange.Redis;

namespace RealEstate.Infrastructure.Services
{
    public class RecentlyViewedService : IRecentlyViewedService
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly ApplicationDbContext _context;

        public RecentlyViewedService(IConnectionMultiplexer redis, ApplicationDbContext context)
        {
            _redis = redis;
            _context = context;
        }

        public async Task AddToHistoryAsync(Guid userId, Guid propertyId)
        {
            // 1. Persist to PostgreSQL database
            var viewLog = new RecentlyViewed
            {
                UserId = userId,
                PropertyId = propertyId,
                ViewedAt = DateTime.UtcNow
            };

            _context.RecentlyViewed.Add(viewLog);
            await _context.SaveChangesAsync();

            // 2. Add to Redis Sorted Set
            try
            {
                var db = _redis.GetDatabase();
                var redisKey = $"user:recently-viewed:{userId}";

                // Score is timestamp in ticks to keep ordering
                double score = DateTime.UtcNow.Ticks;
                await db.SortedSetAddAsync(redisKey, propertyId.ToString(), score);

                // Keep only top 20 items (delete older ones)
                await db.SortedSetRemoveRangeByRankAsync(redisKey, 0, -21);
            }
            catch (Exception)
            {
                // Fail silently for cache operations to ensure database is source of truth
            }
        }

        public async Task<List<Guid>> GetHistoryAsync(Guid userId)
        {
            var redisKey = $"user:recently-viewed:{userId}";

            try
            {
                var db = _redis.GetDatabase();
                var members = await db.SortedSetRangeByRankAsync(redisKey, 0, -1, Order.Descending);

                if (members.Length > 0)
                {
                    return members.Select(m => Guid.Parse(m.ToString())).ToList();
                }
            }
            catch (Exception)
            {
                // Fallback to DB
            }

            // Fallback: Read from PostgreSQL
            var history = await _context.RecentlyViewed
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.ViewedAt)
                .Select(r => r.PropertyId)
                .Take(20)
                .Distinct()
                .ToListAsync();

            // Warm up Redis Cache in background
            if (history.Count > 0)
            {
                try
                {
                    var db = _redis.GetDatabase();
                    var batch = db.CreateBatch();

                    // Add items back in reverse order so the most recent is highest
                    for (int i = history.Count - 1; i >= 0; i--)
                    {
                        double score = DateTime.UtcNow.AddSeconds(-i).Ticks;
                        await batch.SortedSetAddAsync(redisKey, history[i].ToString(), score);
                    }
                    batch.Execute();
                }
                catch (Exception)
                {
                    // Fail silently
                }
            }

            return history;
        }
    }
}

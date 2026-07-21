namespace RealEstate.Domain.Enums
{
    public enum InquiryStatus
    {
        New = 0,
        Read = 1,
        Replied = 2,
        InProgress = 3,
        Closed = 4,
        Cancelled = 5
    }

    public enum PreferredContactMethod
    {
        Phone = 0,
        Email = 1,
        Chat = 2
    }

    public enum AppointmentStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2,
        Rescheduled = 3,
        Completed = 4,
        Cancelled = 5
    }

    public enum MessageContentType
    {
        Text = 0,
        Image = 1,
        File = 2,
        OfferCard = 3
    }

    public enum NotificationType
    {
        NewInquiry = 0,
        InquiryReply = 1,
        AppointmentRequest = 2,
        AppointmentApproved = 3,
        AppointmentRejected = 4,
        AppointmentReminder = 5,
        NewMessage = 6,
        OfferReceived = 7,
        ReviewReceived = 8
    }

    public enum OfferStatus
    {
        Pending = 0,
        Accepted = 1,
        Rejected = 2,
        Countered = 3,
        Expired = 4,
        Cancelled = 5
    }
}

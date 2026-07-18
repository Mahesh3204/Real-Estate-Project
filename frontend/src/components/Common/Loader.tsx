import React from 'react';
import { useAppSelector } from '../../store/hooks';

const Loader: React.FC = () => {
  const isLoading = useAppSelector((state) => state.loader.isLoading);

  if (!isLoading) return null;

  return (
    <div className="loader-overlay" id="global-loader">
      <div className="loader-spinner"></div>
      <div className="loader-text">Loading...</div>
    </div>
  );
};

export default Loader;

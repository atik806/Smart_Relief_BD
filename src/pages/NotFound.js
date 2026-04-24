import React from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import './NotFound.css';

export default function NotFound() {
  return (
    <PageTransition>
      <div className="not-found-page">
        <div className="container">
          <p className="not-found-code" aria-hidden>
            404
          </p>
          <h1 className="not-found-title">Page not found</h1>
          <p className="not-found-desc">
            The page you requested does not exist or has moved.
          </p>
          <Link to="/" className="btn btn-primary not-found-link">
            Back to dashboard
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}

import React from 'react';
import { Link } from 'react-router';

/**
 * Footer Component
 * Site footer with copyright, links, and contact information
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About Section */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Sing Buri Adventist Center</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              A welcoming community of faith serving the Sing Buri area. Join us for worship,
              fellowship, and spiritual growth.
            </p>
            <p className="text-sm text-muted-foreground">
              ศูนย์แอดเวนตีสต์สิงห์บุรี
              <br />
              ชุมชนแห่งศรัทธาที่อบอุ่น
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm transition hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm transition hover:text-white">
                  Events & Services
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-sm transition hover:text-white">
                  Announcements
                </Link>
              </li>
              <li>
                <Link to="/members" className="text-sm transition hover:text-white">
                  Member Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <svg
                  className="mt-0.5 h-5 w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Sing Buri, Thailand</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg
                  className="mt-0.5 h-5 w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:contact@singburi-adventist.org"
                  className="transition hover:text-white"
                >
                  contact@singburi-adventist.org
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <svg
                  className="mt-0.5 h-5 w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p>Sabbath Services:</p>
                  <p className="text-muted-foreground">Saturday 9:30 AM - 12:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-800 pt-6">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Sing Buri Adventist Center. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/privacy" className="transition hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="transition hover:text-white">
                Terms of Service
              </Link>
              <a
                href="https://adventist.org"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                Seventh-day Adventist Church
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

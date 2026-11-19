'use client';

import Link from 'next/link';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const footerLinks = {
  Product: [
    { label: 'Download', href: '/' },
    { label: 'History', href: '/history' },
    { label: 'Settings', href: '/settings' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Disclaimer', href: '#' },
  ],
  Resources: [
    { label: 'Admin Panel', href: '/admin' },
    { label: 'API Docs', href: '#' },
    { label: 'GitHub', href: 'https://github.com' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-glass)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
                <ArrowDownTrayIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">FetchLy</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Universal media downloader for videos, audio, and images from thousands of platforms.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                {section}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-[var(--border-glass)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} FetchLy. For personal use only. Respect platform terms of service.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Built with ❤️ using Next.js & Express
          </p>
        </div>
      </div>
    </footer>
  );
}

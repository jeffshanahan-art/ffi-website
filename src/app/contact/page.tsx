import type { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact — FFI',
  description:
    'Get in touch with the Founding Fathers Invitational. Questions, suggestions, and comments welcome.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-16">
        <SectionHeading
          title="Contact"
          subtitle="Questions, suggestions, or just want to talk golf? We'd love to hear from you."
        />
        <div className="border-b border-gray mt-6" />

        <div className="mt-12 grid md:grid-cols-[1fr_1.5fr] gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-xl text-blue font-normal">
              Jeff Shanahan
            </h3>
            <p className="text-slate text-sm mt-1">
              Tournament Director
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-slate uppercase tracking-wide mb-1">Email</p>
                <a
                  href="mailto:jeff@cobbscreek.org"
                  className="text-blue hover:text-blue/70 transition-colors text-sm"
                >
                  jeff@cobbscreek.org
                </a>
              </div>

              <div>
                <p className="text-xs text-slate uppercase tracking-wide mb-1">Address</p>
                <address className="not-italic text-sm text-black leading-relaxed">
                  The Cobbs Creek Golf Campus<br />
                  7403 Lansdowne Avenue<br />
                  Philadelphia, PA 19151
                </address>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray">
              <p className="text-slate text-sm leading-relaxed italic">
                &ldquo;Play well gentlemen. Don&rsquo;t forget to enjoy the walk.&rdquo;
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="font-serif text-xl text-blue font-normal mb-6">
              Send a Message
            </h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}

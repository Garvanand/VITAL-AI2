import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { ArrowUpRight, Github, Twitter, Linkedin, Mail, ChevronRight } from 'lucide-react';

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    const footerElement = document.getElementById('dynamic-footer');
    if (footerElement) observer.observe(footerElement);

    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <footer id="dynamic-footer" className="relative mt-24 overflow-hidden dynamic-footer-bg">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full grain-background opacity-30" />
        <motion.div
          className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-[#4d94ff]/10 blur-3xl footer-glow"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-[#fff800]/10 blur-3xl footer-glow"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pt-16 pb-12"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
        >
          {/* Company section */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold mb-2">Vital AI</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Empowering the future through intelligent AI solutions that transform your business.
            </p>
            <div className="flex gap-4">
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github size={20} />
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter size={20} />
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin size={20} />
              </motion.a>
              <motion.a
                href="mailto:info@vital-ai.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail size={20} />
              </motion.a>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold mb-2">Navigation</h3>
            <FooterLink href="/" label="Home" />
            <FooterLink href="/about" label="About Us" />
            <FooterLink href="/help/faq" label="FAQ" />
            <FooterLink href="/help/contact" label="Contact" />
            <FooterLink href="/help/support" label="Support" />
          </motion.div>

          {/* Resources Links */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold mb-2">Resources</h3>
            <FooterLink href="/blog" label="Blog" external />
            <FooterLink href="/documentation" label="Documentation" external />
            <FooterLink href="/case-studies" label="Case Studies" external />
            <FooterLink href="/api" label="API Reference" external />
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Subscribe to our newsletter for the latest updates and insights.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 bg-background border border-border rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-[#fff800]/50 newsletter-input-glow"
              />
              <motion.button
                className="px-4 py-2 bg-[#121212] hover:bg-[#121212]/80 text-white rounded-r-md flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Tools Section with animation */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          className="py-8"
        >
          <h3 className="text-center text-base mb-6">Built with modern technologies</h3>
          <div className="flex flex-row flex-wrap gap-6 justify-center md:justify-between items-center">
            {/* <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Image src={'/assets/icons/logo/paddle-logo.svg'} alt={'Paddle logo'} width={120} height={32} />
            </motion.div> */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Image src={'/assets/icons/logo/tailwind-logo.svg'} alt={'TailwindCSS logo'} width={194} height={24} />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Image src={'/assets/icons/logo/supabase-logo.svg'} alt={'Supabase logo'} width={150} height={32} />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Image src={'/assets/icons/logo/nextjs-logo.svg'} alt={'Next.js logo'} width={120} height={24} />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Image src={'/assets/icons/logo/shadcn-logo.svg'} alt={'Shadcn logo'} width={137} height={32} />
            </motion.div>
          </div>
        </motion.div>

        {/* Animated separator */}
        <div className="relative">
          <Separator className="footer-border" />
          <motion.div
            className="featured-yellow-highlight-bg"
            initial={{ opacity: 0, width: '0%' }}
            animate={isVisible ? { opacity: 1, width: '248px' } : {}}
            transition={{ delay: 0.5, duration: 1 }}
          />
        </div>

        {/* Bottom footer */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center py-6 text-muted-foreground text-sm"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
        >
          <motion.div
            variants={itemVariants}
            className="flex justify-center md:justify-start items-center gap-2 mb-4 md:mb-0"
          >
            <span>An initiative by team OpenHivers</span>
            {/* <Image src={'/assets/icons/logo/paddle-white-logo.svg'} alt={'Paddle logo'} width={54} height={14} /> */}
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6">
            {/* <Link className="text-sm hover:text-foreground transition-colors" href={'https://paddle.com'} target={'_blank'}>
              <span className="flex items-center gap-1">
                Explore Paddle
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link> */}
            <Link
              className="text-sm hover:text-foreground transition-colors"
              href={'https://www.paddle.com/legal/terms'}
              target={'_blank'}
            >
              <span className="flex items-center gap-1">
                Terms of use
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
            <Link
              className="text-sm hover:text-foreground transition-colors"
              href={'https://www.paddle.com/legal/privacy'}
              target={'_blank'}
            >
              <span className="flex items-center gap-1">
                Privacy
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
            <div>© {new Date().getFullYear()} Vital AI. All rights reserved.</div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}

// Helper component for footer links
function FooterLink({ href, label, external = false }: { href: string; label: string; external?: boolean }) {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="text-muted-foreground hover:text-foreground transition-colors footer-link-hover"
    >
      <Link href={href} className="flex items-center gap-1 text-sm" target={external ? '_blank' : undefined}>
        {label}
        {external && <ArrowUpRight className="h-3.5 w-3.5" />}
      </Link>
    </motion.div>
  );
}

import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'QA Excellence Knowledge Base',
  tagline: 'Master Quality Assurance & Test Automation - From Foundation to Leadership',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://user.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/QA-SOB/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'User', // Usually your GitHub org/user name.
  projectName: 'QA-SOB', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/User/QA-SOB/tree/main/website/',
        },
        blog: false, // Disable blog for QA documentation focus
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'QA Excellence',
      logo: {
        alt: 'QA Excellence Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Knowledge Base',
        },
        {
          href: 'https://github.com/User/QA-SOB',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Knowledge Base',
          items: [
            {
              label: 'Interview Preparation',
              to: '/docs/interview-preparation',
            },
            {
              label: 'QA Philosophy',
              to: '/docs/qa-philosophy',
            },
            {
              label: 'Best Practices',
              to: '/docs/best-practices',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Testing Methodology',
              to: '/docs/testing-methodology',
            },
            {
              label: 'Implementation Roadmap',
              to: '/docs/implementation-roadmap',
            },
            {
              label: 'Practice Labs',
              to: '/docs/practice-labs',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub Repository',
              href: 'https://github.com/User/QA-SOB',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} QA Excellence Knowledge Base. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'typescript', 'javascript', 'python', 'bash', 'yaml', 'json', 'xml', 'gherkin'],
    },
    // Search will be configured later after resolving MDX issues
  } satisfies Preset.ThemeConfig,
};

export default config;

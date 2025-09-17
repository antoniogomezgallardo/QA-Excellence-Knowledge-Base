import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '🎯 Interview Preparation',
      collapsed: false,
      items: [
        'interview-preparation/senior-qa-interview-questions-bank',
        'interview-preparation/playwright-mastery-guide',
        'interview-preparation/api-testing-mastery',
        'interview-preparation/selenium-expertise-migration',
        'interview-preparation/code-examples-portfolio',
        'interview-preparation/technical-scenarios-solutions',
        'interview-preparation/bdd-cucumber-strategic-guide',
        'interview-preparation/docker-qa-containerization',
        'interview-preparation/performance-testing-architecture',
        'interview-preparation/final-interview-checklist',
      ],
    },
    {
      type: 'category',
      label: '🧠 QA Philosophy',
      items: [
        'qa-philosophy/quality-guardian-manifesto',
        'qa-philosophy/testing-principles',
      ],
    },
    {
      type: 'category',
      label: '🔬 Testing Methodology',
      items: [
        'testing-methodology/testing-phases-complete',
        'testing-methodology/manual-testing-excellence',
      ],
    },
    {
      type: 'category',
      label: '🗺️ Implementation Roadmap',
      items: [
        'implementation-roadmap/day-quality-roadmap',
        'implementation-roadmap/week-by-week-plan',
      ],
    },
    {
      type: 'category',
      label: '🔧 Frameworks & Templates',
      items: [
        'frameworks-templates/test-strategy-template',
        'frameworks-templates/quality-metrics-dashboard',
      ],
    },
    {
      type: 'category',
      label: '⭐ Best Practices',
      items: [
        'best-practices/API-Testing-Excellence',
        'best-practices/Accessibility-Testing-Automated',
        'best-practices/Accessibility-Testing-Manual',
        'best-practices/CI-CD-Integration',
        'best-practices/Code-Review-Excellence',
        'best-practices/Database-Testing-Advanced',
        'best-practices/Documentation-Standards',
        'best-practices/Microservices-Testing',
        'best-practices/Mobile-Testing-Standards',
        'best-practices/Performance-Testing-Standards',
        'best-practices/Quality-Metrics-Advanced',
        'best-practices/Risk-Management-Framework',
        'best-practices/Security-Testing-Essentials',
        'best-practices/SDLC-Testing-Best-Practices',
        'best-practices/Team-Collaboration-Guide',
        'best-practices/Test-Data-Management',
      ],
    },
    {
      type: 'category',
      label: '🧪 Practice Labs',
      items: [
        'practice-labs/foundation-labs',
        'practice-labs/technical-mastery',
        'practice-labs/advanced-scenarios',
        'practice-labs/leadership-challenges',
      ],
    },
    'qa-master-learning-onepager',
  ],
};

export default sidebars;

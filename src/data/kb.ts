export interface KBArticle {
  id: string;
  title: string;
  keywords: string[];
  content: string;
}

export const knowledgeBase: KBArticle[] = [
  {
    id: 'kb-001',
    title: 'Password Reset Guide',
    keywords: ['password', 'reset', 'login', 'access', 'forgot', 'account'],
    content: 'To reset your password, navigate to the login page and click "Forgot Password". Enter your registered email address, and we will send you a secure link to create a new password. The link expires in 24 hours.'
  },
  {
    id: 'kb-002',
    title: 'Refund Policy',
    keywords: ['refund', 'money', 'return', 'charge', 'billing', 'cancel'],
    content: 'Our refund policy allows for full refunds within 30 days of the original purchase date. To request a refund, go to your Billing Dashboard, select the transaction, and click "Request Refund". Processing typically takes 5-7 business days.'
  },
  {
    id: 'kb-003',
    title: 'API Rate Limits',
    keywords: ['api', 'rate', 'limit', '429', 'developer', 'throttle', 'requests'],
    content: 'The standard API rate limit is 1,000 requests per minute per IP address. If you exceed this limit, you will receive a 429 Too Many Requests response. Enterprise customers can request custom rate limits by contacting their account manager.'
  },
  {
    id: 'kb-004',
    title: 'Installation Issues (Windows)',
    keywords: ['install', 'windows', 'error', 'setup', 'fail', 'crash'],
    content: 'If the installation fails on Windows, ensure you are running the installer as an Administrator. Also, check that your antivirus software is not blocking the executable. You may need to temporarily disable real-time protection during installation.'
  },
  {
    id: 'kb-005',
    title: 'Upgrading Your Plan',
    keywords: ['upgrade', 'plan', 'premium', 'pro', 'enterprise', 'features'],
    content: 'To upgrade your plan, log into your account, navigate to Settings > Subscription, and select the plan you wish to upgrade to. The prorated difference will be charged to your payment method on file immediately.'
  }
];

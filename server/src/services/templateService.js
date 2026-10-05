import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template cache
const templateCache = {};

/**
 * Load and compile template
 * @param {string} templateName - Template filename without extension
 * @returns {Function} Compiled template function
 */
const loadTemplate = (templateName) => {
  // Check cache
  if (templateCache[templateName]) {
    return templateCache[templateName];
  }

  // Load template file
  const templatePath = path.join(__dirname, '../templates/email', `${templateName}.hbs`);
  
  try {
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const compiled = handlebars.compile(templateSource);
    
    // Cache the compiled template
    templateCache[templateName] = compiled;
    
    return compiled;
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    throw new Error(`Template ${templateName} not found`);
  }
};

/**
 * Register Handlebars helpers
 */
handlebars.registerHelper('formatPrice', (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
});

handlebars.registerHelper('formatDate', (date) => {
  return new Date(date).toLocaleString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

handlebars.registerHelper('currentYear', () => {
  return new Date().getFullYear();
});

/**
 * Render ticket email template
 */
export const renderTicketEmail = (data) => {
  const template = loadTemplate('ticket');
  return template({
    ...data,
    year: new Date().getFullYear()
  });
};

/**
 * Render order confirmation email template
 */
export const renderOrderConfirmationEmail = (data) => {
  const template = loadTemplate('orderConfirmation');
  return template({
    ...data,
    year: new Date().getFullYear()
  });
};

/**
 * Render password reset email template
 */
export const renderPasswordResetEmail = (data) => {
  const template = loadTemplate('passwordReset');
  return template({
    ...data,
    year: new Date().getFullYear()
  });
};

export default {
  renderTicketEmail,
  renderOrderConfirmationEmail,
  renderPasswordResetEmail
};

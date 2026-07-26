import emailjs from '@emailjs/browser';

export interface EmailJSConfig {
  enabled: boolean;
  serviceId: string;
  templateId: string;
  publicKey: string;
}

const EMAILJS_STORAGE_KEY = 'wedding_emailjs_config';

export const loadEmailJSConfig = (): EmailJSConfig => {
  try {
    const data = localStorage.getItem(EMAILJS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load EmailJS config from localStorage:', err);
  }
  return {
    enabled: false,
    serviceId: '',
    templateId: '',
    publicKey: '',
  };
};

export const saveEmailJSConfig = (config: EmailJSConfig): void => {
  try {
    localStorage.setItem(EMAILJS_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save EmailJS config:', err);
  }
};

export interface EmailParams {
  to_name: string;
  to_email: string;
  subject: string;
  message: string;
  from_name?: string;
  wedding_date?: string;
  venue_name?: string;
  [key: string]: unknown;
}

/**
 * Send a real email via EmailJS browser client SDK
 */
export const sendEmailViaEmailJS = async (
  config: EmailJSConfig,
  params: EmailParams
): Promise<{ success: boolean; error?: string }> => {
  if (!config.enabled) {
    return { success: false, error: 'EmailJS dispatch is currently disabled (Simulation Mode active).' };
  }
  if (!config.serviceId || !config.templateId || !config.publicKey) {
    return { success: false, error: 'Missing EmailJS credentials (Service ID, Template ID, or Public Key).' };
  }

  try {
    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      params as Record<string, unknown>,
      config.publicKey
    );

    if (response.status === 200) {
      return { success: true };
    }
    return { success: false, error: `EmailJS HTTP ${response.status}: ${response.text}` };
  } catch (err: any) {
    console.error('EmailJS SDK Send Error:', err);
    let errMsg = 'Unknown EmailJS error.';
    if (err) {
      if (typeof err === 'string') {
        errMsg = err;
      } else if (typeof err === 'object') {
        if (err.text) {
          errMsg = err.status ? `HTTP ${err.status}: ${err.text}` : err.text;
        } else if (err.message) {
          errMsg = err.message;
        } else {
          try {
            errMsg = JSON.stringify(err);
          } catch {
            errMsg = String(err);
          }
        }
      }
    }
    return { success: false, error: errMsg };
  }
};

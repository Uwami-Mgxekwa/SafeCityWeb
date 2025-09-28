# 📧📱 SafeCity Notification Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: EmailJS Setup (FREE)

1. **Go to [EmailJS.com](https://www.emailjs.com)**
2. **Create free account** (no credit card needed)
3. **Add Email Service:**
   - Click "Email Services" → "Add Service"
   - Choose "Gmail" (easiest)
   - Connect your Gmail account
   - Note the **Service ID** (e.g., `service_abc123`)

4. **Create Email Template:**
   - Click "Email Templates" → "Create New Template"
   - Use this template:

```html
Subject: {{notification_type}} - SafeCity Update

Hi {{user_name}},

You have a new notification from SafeCity!

{{#report_id}}
Report Details:
- Report ID: #{{report_id}}
- Issue Type: {{report_type}}
- Location: {{report_location}}
- Status: {{report_status}}
- Description: {{report_description}}
{{/report_id}}

Thank you for using SafeCity to improve our communities!

Best regards,
The SafeCity Team

Visit: {{app_url}}
```

   - Note the **Template ID** (e.g., `template_xyz789`)

5. **Get Public Key:**
   - Go to "Account" → "General"
   - Copy your **Public Key** (e.g., `user_abc123xyz`)

### Step 2: Update Your Code

Open `js/script.js` and update the configuration:

```javascript
const NOTIFICATION_CONFIG = {
    emailjs: {
        publicKey: 'YOUR_PUBLIC_KEY_HERE',     // From Step 5
        serviceId: 'YOUR_SERVICE_ID_HERE',     // From Step 3
        templateId: 'YOUR_TEMPLATE_ID_HERE'    // From Step 4
    },
    whatsapp: {
        enabled: true,
        businessNumber: '+27123456789' // Your WhatsApp number (optional)
    }
};
```

### Step 3: WhatsApp Setup (Optional)

1. **Get a WhatsApp Business number** (your personal number works too)
2. **Update the businessNumber** in the config above
3. **That's it!** WhatsApp notifications will open the chat with pre-written messages

## 🎯 How It Works

### Email Notifications (Automatic)
- ✅ **Report submitted** - Confirmation email
- ✅ **Report updated** - Status change notifications
- ✅ **Welcome email** - New user registration

### WhatsApp Notifications (User-triggered)
- ✅ **Share report** - Click "Share on WhatsApp" button
- ✅ **Pre-written messages** - Professional templates
- ✅ **Works on all devices** - Mobile and desktop

## 📊 Free Tier Limits

### EmailJS Free Plan:
- ✅ **200 emails/month**
- ✅ **No credit card required**
- ✅ **Perfect for student projects**

### WhatsApp:
- ✅ **Completely free**
- ✅ **No limits**
- ✅ **Uses standard WhatsApp**

## 🧪 Testing

### Test Email:
1. Submit a report in your app
2. Check your email for confirmation
3. If no email arrives, check EmailJS dashboard for errors

### Test WhatsApp:
1. Submit a report
2. Click "Share on WhatsApp" in success modal
3. WhatsApp should open with pre-written message

## 🔧 Customization

### Email Templates:
- Edit templates in EmailJS dashboard
- Add your branding/colors
- Customize messages for different notification types

### WhatsApp Messages:
- Edit messages in `sendWhatsAppNotification()` function
- Add emojis and formatting
- Customize for different report types

## 🆘 Troubleshooting

### Email Not Sending:
1. Check EmailJS dashboard for errors
2. Verify Service ID, Template ID, and Public Key
3. Check browser console for JavaScript errors
4. Ensure Gmail account is properly connected

### WhatsApp Not Opening:
1. Check if WhatsApp is installed
2. Verify phone number format (+27...)
3. Test on different devices/browsers

## 🎓 Student Benefits

- ✅ **Portfolio project** - Shows real-world integration skills
- ✅ **Professional features** - Email and messaging systems
- ✅ **Zero cost** - Perfect for student budgets
- ✅ **Scalable** - Can upgrade when needed
- ✅ **Industry standard** - EmailJS used by many companies

## 🚀 Next Steps

Once basic notifications work, you can add:
- 📧 **Weekly digest emails**
- 📱 **Push notifications** (PWA)
- 🔔 **In-app notifications**
- 📊 **Notification preferences**
- 🎯 **Targeted messaging**

---

**Need help?** The setup should take less than 5 minutes. If you get stuck, just ask! 🤝
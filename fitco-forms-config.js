/* ============================================================
   FitCo form endpoints.

   The waitlist posts to a hosted email provider (Mailchimp or
   Buttondown). Until `waitlistAction` is set to a real endpoint
   the form renders disabled and says so — it must never tell a
   visitor they have subscribed when nothing was sent anywhere.

   Mailchimp : the embedded form's `action` URL, which ends in
               /subscribe/post?u=<user-id>&id=<audience-id>
               and expects the email field to be named EMAIL.
   Buttondown: https://buttondown.com/api/emails/embed-subscribe/<username>
               which expects the email field to be named email.

   Both are public form endpoints by design — no API key belongs
   in this file, or in any client-side file.
   ============================================================ */
window.__FITCO_FORMS__ = {
  // OWNER DECISION REQUIRED — paste the provider form action here.
  waitlistAction: '',
  // 'mailchimp' | 'buttondown' — decides the field name that is posted.
  waitlistProvider: 'buttondown',
};

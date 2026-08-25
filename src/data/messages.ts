export type MessageCategory = 
  | 'Initial Client Communication'
  | 'File Sharing & Sending'
  | 'Approval Requests & Reminders'
  | 'Project Status Updates'
  | 'Invoices & Payments'
  | 'Post-Project & Follow-ups'
  | 'Client Questions & Objections'
  | 'Payment Confirmation & Follow-up'
  | 'WhatsApp Link Generation'
  | 'Context-Specific Professional Notes'
  | 'End of Discussion & Closing'
  | 'My Custom Messages';

export type MessageTemplate = {
  id: string;
  category: MessageCategory;
  title: string;
  content: string;
};

export const INITIAL_MESSAGES: MessageTemplate[] = [
  // CATEGORY 1: Initial Client Communication
  { id: 'm1', category: 'Initial Client Communication', title: 'Welcome / Onboarding', content: "Welcome to {freelancer_name}! I'm excited to work with you.\nAll project files, approvals, and invoices will be shared here.\nYou'll receive links via WhatsApp. No login needed. Just click and approve." },
  { id: 'm2', category: 'Initial Client Communication', title: 'Set Expectations', content: "Here's how we'll work together:\n1. I share files via WhatsApp link\n2. You click, review, tap \"Approve\"\n3. I send invoice with UPI link\n4. You pay in 10 seconds\nSimple. No login. No passwords." },
  { id: 'm3', category: 'Initial Client Communication', title: 'Share Client Portal Link', content: "Here's your personal client portal where you can see all your projects:\n{portal_link}\nBookmark this link. Use your email and this token to login:\nToken: {client_token}" },
  { id: 'm4', category: 'Initial Client Communication', title: 'Request Missing Information', content: "To start your {project_name}, I need:\n1. {requirement_1}\n2. {requirement_2}\n3. {requirement_3}\nPlease share when ready." },
  { id: 'm5', category: 'Initial Client Communication', title: 'Confirm Project Start', content: "Great! I've received all details. I'm starting work on {project_name}.\nExpected delivery: {delivery_date}.\nI'll share files here for your approval." },

  // CATEGORY 2: File Sharing & Sending
  { id: 'm6', category: 'File Sharing & Sending', title: 'Send File with Approval Link', content: "Here's {file_name} for {project_name}.\nTap to approve: {approval_link}\nView file: {file_link}\nLet me know if any changes needed." },
  { id: 'm7', category: 'File Sharing & Sending', title: 'Send Multiple Files', content: "Here are {number} files for {project_name}:\n1. {file_1_name} → {approval_link_1}\n2. {file_2_name} → {approval_link_2}\n3. {file_3_name} → {approval_link_3}\nPlease review and approve when ready." },
  { id: 'm8', category: 'File Sharing & Sending', title: 'Resend File (Client Lost Link)', content: "Here's the file again: {file_link}\nApprove here: {approval_link}\nLet me know if you face any issues." },
  { id: 'm9', category: 'File Sharing & Sending', title: 'Send Updated File Version', content: "Here's the updated {file_name} with requested changes.\nPrevious version replaced.\nApprove: {approval_link}" },
  { id: 'm10', category: 'File Sharing & Sending', title: 'Send Final Files After Approval', content: "Thanks for approval! Here are your final files:\n{file_link}\nInvoice will be shared shortly." },
  { id: 'm11', category: 'File Sharing & Sending', title: 'Share Large File (Video/ZIP)', content: "Your file is ready (size: {file_size}MB).\nDownload here: {file_link}\nFor best experience, use WiFi." },
  { id: 'm12', category: 'File Sharing & Sending', title: 'Request Client File Upload', content: "Can you share {requested_file}?\nUpload here: {upload_link}\nI need this to proceed with {project_name}." },
  { id: 'm13', category: 'File Sharing & Sending', title: 'Confirm File Receipt', content: "Received your files. Thanks! I'll review and get back to you within {time_frame}." },

  // CATEGORY 3: Approval Requests & Reminders
  { id: 'm14', category: 'Approval Requests & Reminders', title: 'Request Approval (First Reminder)', content: "Gentle reminder: {file_name} is waiting for your approval.\nApprove: {approval_link}\nI can proceed only after approval." },
  { id: 'm15', category: 'Approval Requests & Reminders', title: 'Second Reminder (Urgent)', content: "Urgent: {file_name} needs your approval by {deadline}.\nApprove here: {approval_link}\nOtherwise project delivery may get delayed." },
  { id: 'm16', category: 'Approval Requests & Reminders', title: 'Third Reminder (Final)', content: "Final reminder: {file_name} is pending your approval for 7 days.\nPlease approve here: {approval_link}\nIf I don't hear back by tomorrow, project will be paused." },
  { id: 'm17', category: 'Approval Requests & Reminders', title: 'Approval Received (Confirmation)', content: "✅ Approval received for {file_name}. Thanks!\nMoving to next step: {next_step}" },
  { id: 'm18', category: 'Approval Requests & Reminders', title: 'Request Changes (Client Said Changes Needed)', content: "Noted! I'll make these changes:\n{list_of_changes}\nWill share updated version within {time_frame}." },
  { id: 'm19', category: 'Approval Requests & Reminders', title: 'Partial Approval', content: "Thanks for approving {approved_files_count} file(s).\nStill waiting for your approval on:\n{file_names_pending}\nPlease review when possible: {approval_links}" },
  { id: 'm20', category: 'Approval Requests & Reminders', title: 'Approval Expired', content: "Your approval link for {file_name} has expired.\nHere's a new link: {approval_link}\nPlease approve within {days} days." },
  { id: 'm21', category: 'Approval Requests & Reminders', title: 'Bulk Approval Request', content: "{number} files ready for your review:\n{file_list_with_links}\nTotal time to review: approx {review_time} minutes." },
  { id: 'm22', category: 'Approval Requests & Reminders', title: 'Client Viewed But Not Approved', content: "I see you viewed {file_name}. Any questions or concerns?\nApprove here when ready: {approval_link}\nHappy to make changes if needed." },
  { id: 'm23', category: 'Approval Requests & Reminders', title: 'Reminder for Overdue Approval', content: "Approval for {file_name} is overdue by {days} days.\nThis is impacting {project_name} delivery.\nOriginal delivery date: {original_date}\nNew estimated date: {new_date} (if approved today)\nPlease approve: {approval_link}" },

  // CATEGORY 4: Project Status Updates
  { id: 'm24', category: 'Project Status Updates', title: 'Project Started', content: "🚀 Project \"{project_name}\" has started.\nCurrent status: {status}\nNext update: {next_update_date}" },
  { id: 'm25', category: 'Project Status Updates', title: 'Progress Update (50%)', content: "📊 Progress update for {project_name}: 50% complete.\nCompleted: {completed_items}\nRemaining: {remaining_items}\nOn track for delivery by {delivery_date}." },
  { id: 'm26', category: 'Project Status Updates', title: 'Progress Update (75%)', content: "📊 Progress update for {project_name}: 75% complete.\nAlmost there! Expect delivery by {delivery_date}." },
  { id: 'm27', category: 'Project Status Updates', title: 'Project Delayed', content: "⚠️ Update on {project_name}: Due to {reason},\ndelivery is delayed by {days} days.\nNew delivery date: {new_date}\nApologies for the inconvenience." },
  { id: 'm28', category: 'Project Status Updates', title: 'Project Completed', content: "✅ Project \"{project_name}\" is complete!\nFinal files: {file_link}\nInvoice: {invoice_link}\nThank you for working with me!" },
  { id: 'm29', category: 'Project Status Updates', title: 'Project On Hold', content: "⏸️ Project \"{project_name}\" is on hold.\nWaiting for: {required_from_client}\nResume as soon as I receive it." },

  // CATEGORY 5: Invoices & Payments
  { id: 'm30', category: 'Invoices & Payments', title: 'Send Invoice', content: "💰 Invoice #{invoice_no} for ₹{amount} is ready.\nDue date: {due_date}\nThank you for your business!" },
  { id: 'm31', category: 'Invoices & Payments', title: 'Payment Reminder (3 Days Before Due)', content: "Friendly reminder: Invoice #{invoice_no} of ₹{amount}\nis due on {due_date}." },
  { id: 'm32', category: 'Invoices & Payments', title: 'Payment Reminder (Due Date)', content: "Today is the due date for Invoice #{invoice_no} (₹{amount}).\nPlease pay today." },
  { id: 'm33', category: 'Invoices & Payments', title: 'Overdue Payment Reminder (7 Days)', content: "⚠️ Invoice #{invoice_no} (₹{amount}) is overdue by 7 days.\nPlease clear at earliest.\nLate fees may apply after {late_fee_date}." },
  { id: 'm34', category: 'Invoices & Payments', title: 'Overdue Payment Reminder (15 Days)', content: "URGENT: Invoice #{invoice_no} of ₹{amount} is overdue by 15 days.\nFinal reminder before escalation." },
  { id: 'm35', category: 'Invoices & Payments', title: 'Payment Received', content: "✅ Payment of ₹{amount} received for Invoice #{invoice_no}.\nThank you! Receipt attached: {receipt_link}" },
  { id: 'm36', category: 'Invoices & Payments', title: 'Partial Payment Received', content: "Received ₹{amount_paid} for Invoice #{invoice_no}.\nRemaining balance: ₹{balance_due}." },
  { id: 'm37', category: 'Invoices & Payments', title: 'Resend Invoice', content: "Here's your invoice again:\nInvoice #{invoice_no} - ₹{amount}\nDue: {due_date}" },

  // CATEGORY 6: Post-Project & Follow-ups
  { id: 'm38', category: 'Post-Project & Follow-ups', title: 'Thank You Message', content: "Thank you for working with me on {project_name}!\nIt was a pleasure.\nLooking forward to our next project together." },
  { id: 'm39', category: 'Post-Project & Follow-ups', title: 'Request Testimonial/Review', content: "Glad you loved the work! Would you mind leaving a quick review?\n{review_link}\nYour feedback helps me grow." },
  { id: 'm40', category: 'Post-Project & Follow-ups', title: 'Referral Request', content: "If you know anyone who needs {services_offered},\nI'd appreciate a referral.\nHere's my portfolio: {portfolio_link}\nThank you!" },
  { id: 'm41', category: 'Post-Project & Follow-ups', title: 'Re-engagement (No contact in 3 months)', content: "Long time! Hope you're doing well.\nAny upcoming projects where I can help?\nHere's 10% off your next project: {discount_code}" },
  { id: 'm42', category: 'Post-Project & Follow-ups', title: 'Birthday/Festival Greeting', content: "Wishing you a very happy {occasion}!\nFrom your favorite freelancer 😊\nHere's 15% off your next project: {discount_code}" },

  // CATEGORY 7: Client Questions & Objections
  { id: 'm43', category: 'Client Questions & Objections', title: 'Client Asks "Why should I pay?"', content: "You're paying for:\n✓ Professional quality work\n✓ Timely delivery\n✓ Unlimited revisions until approval\n✓ Post-delivery support for {days} days\n✓ Legal proof of approval\nFair price for guaranteed results." },
  { id: 'm44', category: 'Client Questions & Objections', title: 'Client Asks for Discount', content: "I understand budget concerns.\nI can offer {discount_percentage}% off if you:\n- Pay 50% upfront\n- Or refer 2 clients to me\nLet me know what works." },
  { id: 'm45', category: 'Client Questions & Objections', title: 'Client Says "I\'ll pay later"', content: "I completely understand.\nJust to clarify, final files will be shared after payment.\nLet me know when you're ready." },
  { id: 'm46', category: 'Client Questions & Objections', title: 'Client Says "I never approved that"', content: "As per our records, {file_name} was approved by you on {approval_date}\nfrom IP address {ip_address}.\nScreenshot attached for reference: {screenshot_link}\nPlease check and confirm." },
  { id: 'm47', category: 'Client Questions & Objections', title: 'Client Says "Too expensive compared to others"', content: "My pricing reflects the quality and reliability I deliver.\nCheaper options often mean:\n- No revisions\n- Delayed delivery\n- No legal proof\n- No post-project support\nYou get what you pay for." },
  { id: 'm48', category: 'Client Questions & Objections', title: 'Client Says "Can you do it faster?"', content: "I can deliver faster for an additional rush fee of ₹{rush_fee}.\nOriginal timeline: {original_days} days\nRush timeline: {rush_days} days\nLet me know if you want to proceed." },
  { id: 'm49', category: 'Client Questions & Objections', title: 'Client Asks for Refund', content: "I understand you're not satisfied.\nMy refund policy: {refund_policy_summary}\nTo proceed with refund request, please share specific concerns.\nI'll also try to resolve the issue first." },
  { id: 'm50', category: 'Client Questions & Objections', title: 'Client Wants to Cancel Mid-Project', content: "Sorry to hear you want to cancel.\nAs per policy, work completed so far is billable.\nCompleted: {completed_percentage}%\nAmount due: ₹{amount_due}\nLet me know how you want to proceed." },

  // CATEGORY 8: Payment Confirmation & Follow-up
  { id: 'm51', category: 'Payment Confirmation & Follow-up', title: 'Payment Reminder Follow-up', content: "This is a follow-up for your payment for Invoice #{invoice_no}." },
  { id: 'm52', category: 'Payment Confirmation & Follow-up', title: 'Payment Success Confirmation', content: "We've received your payment of ₹{amount} for Invoice #{invoice_no}.\nPayment ID: {transaction_id}\nThank you! Your files are ready: {file_link}" },
  { id: 'm53', category: 'Payment Confirmation & Follow-up', title: 'Payment Failed (Client tried but failed)', content: "Your payment of ₹{amount} for Invoice #{invoice_no} failed.\nPossible reasons: insufficient balance, bank issue.\nPlease try again or use different UPI app." },
  { id: 'm54', category: 'Payment Confirmation & Follow-up', title: 'UPI ID Request', content: "My UPI ID: {freelancer_upi_id}\nPlease send ₹{amount} with this note: \"{invoice_number}\"\nSend screenshot after payment: {screenshot_upload_link}" },
  { id: 'm55', category: 'Payment Confirmation & Follow-up', title: 'Request Bank Transfer Details', content: "Bank transfer details:\nAccount Name: {freelancer_name}\nBank: {bank_name}\nAccount Number: {account_number}\nIFSC: {ifsc_code}\nUPI ID: {freelancer_upi_id}\nSend screenshot after transfer: {screenshot_upload_link}" },

  // CATEGORY 9: WhatsApp Link Generation
  { id: 'm56', category: 'WhatsApp Link Generation', title: 'Send Deskflo Link for Non-Dashboard Client', content: "{freelancer_name} shared a file with you:\n📁 {file_name}\n✅ Approve: {approval_link}\n👁️ View: {file_link}" },
  { id: 'm57', category: 'WhatsApp Link Generation', title: 'Send Deskflo Link for Portal Client', content: "New update from {freelancer_name}:\n📁 {file_name} is ready for review.\n✅ Approve: {approval_link}\n📋 View all: {portal_link}" },
  { id: 'm58', category: 'WhatsApp Link Generation', title: 'Send Invoice Link Only', content: "Invoice #{invoice_no} from {freelancer_name}\nAmount: ₹{amount}\nDue: {due_date}" },

  // CATEGORY 10: Context-Specific Professional Notes
  { id: 'm59', category: 'Context-Specific Professional Notes', title: 'Out of Office / Vacation', content: "Thanks for your message. I'm currently out of office until {return_date}.\nFor urgent matters, contact: {backup_contact}\nI'll respond to all messages on {return_date}." },
  { id: 'm60', category: 'Context-Specific Professional Notes', title: 'Sick Day', content: "I'm unwell today and unable to work at full capacity.\nI'll respond to urgent matters only.\nExpected to resume fully by {resume_date}.\nApologies for any delay." },
  { id: 'm61', category: 'Context-Specific Professional Notes', title: 'Follow-up After Meeting/Call', content: "Thanks for your time today.\nAs discussed:\n{summary_of_discussion}\nNext steps:\n{next_actions}\nI'll share files by {delivery_date}." },
  { id: 'm62', category: 'Context-Specific Professional Notes', title: 'Request for Meeting/Call', content: "To move {project_name} forward, I'd like to hop on a quick call.\nAvailable: {available_time_slots}\nLet me know what works for you.\nDuration: {duration} minutes." },
  { id: 'm63', category: 'Context-Specific Professional Notes', title: 'Happy Client Follow-up (Post 1 month)', content: "It's been a month since we completed {project_name}.\nHow is everything holding up?\nAny issues or need any tweaks?\nFirst 3 months of support is free." },
  { id: 'm64', category: 'Context-Specific Professional Notes', title: 'Scope Change Confirmation', content: "Scope change request received:\nOriginal scope: {original_scope}\nNew request: {new_request}\nAdditional cost: ₹{additional_cost}\nAdditional time: {additional_days} days\nPlease approve to proceed: {approval_link}" },

  // CATEGORY 11: End of Discussion & Closing
  { id: 'm65', category: 'End of Discussion & Closing', title: 'No Response Follow-up (Final Attempt)', content: "I've tried reaching you multiple times regarding {project_name}.\nI'm archiving this project for now.\nWhen you're ready to resume, just reply to this message.\nYour files are saved here: {archive_link}" },
  { id: 'm66', category: 'End of Discussion & Closing', title: 'Project Closure Confirmation', content: "Project \"{project_name}\" is officially closed.\n✓ All files delivered\n✓ Payment received\n✓ Support period ends on {support_end_date}\nThank you for choosing {freelancer_name}!\nSee you on the next project." },
];

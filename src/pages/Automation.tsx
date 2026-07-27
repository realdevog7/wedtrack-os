import React, { useState } from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { EmailCampaign } from '../types';
import {
  Send,
  Mail,
  CheckCircle2,
  Sparkles,
  Plus,
  Eye,
  MousePointer,
  Trash2,
  Edit3,
  Users,
  AlertCircle,
  X,
  Check,
  FileText,
  Zap,
  Filter,
  Copy,
  Paperclip,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const Automation: React.FC = () => {
  const {
    wedding,
    guests,
    emailCampaigns,
    emailTemplates,
    addEmailCampaign,
    deleteEmailCampaign,
    sendCampaignNow,
    addEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
  } = useWedding();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'instant'>('campaigns');
  const [expandedRecipientsCampId, setExpandedRecipientsCampId] = useState<string | null>(null);

  // Campaign Creator Modal
  const [showCreateCamp, setShowCreateCamp] = useState(false);
  const [newCampTitle, setNewCampTitle] = useState('');
  const [newCampFilter, setNewCampFilter] = useState<'all' | 'confirmed' | 'unconfirmed' | 'declined'>('all');

  const [selectedTmplId, setSelectedTmplId] = useState<string>(emailTemplates[0]?.id || '');

  // Template Creator/Editor Modal
  const [showTmplModal, setShowTmplModal] = useState(false);
  const [editingTmplId, setEditingTmplId] = useState<string | null>(null);
  const [tmplName, setTmplName] = useState('');
  const [tmplSubject, setTmplSubject] = useState('');
  const [tmplBody, setTmplBody] = useState('');
  const [previewModeId, setPreviewModeId] = useState<string | null>(null);



  // Instant Test Sender
  const [quickGuestId, setQuickGuestId] = useState<string>(guests[0]?.id || '');
  const [quickSubject, setQuickSubject] = useState('We cannot wait to celebrate with you!');
  const [quickBody, setQuickBody] = useState(
    'Hi there!\n\nJust a quick reminder that our wedding is coming up soon! Please check your guest portal for any dietary or travel updates.\n\nWith love,\nThe Happy Couple'
  );
  const [quickStatusMsg, setQuickStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Attachment state
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAttachmentFile(file);
    if (attachmentUrl) URL.revokeObjectURL(attachmentUrl);
    if (file) {
      setAttachmentUrl(URL.createObjectURL(file));
    } else {
      setAttachmentUrl(null);
    }
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    if (attachmentUrl) URL.revokeObjectURL(attachmentUrl);
    setAttachmentUrl(null);
  };

  const getMatchingGuestCount = (filter: string, camp?: EmailCampaign) => {
    if (filter === 'custom' && camp?.customGuestIds) return camp.customGuestIds.length;
    if (filter === 'all') return guests.length;
    if (filter === 'confirmed') return guests.filter((g) => g.rsvpStatus === 'confirmed').length;
    if (filter === 'unconfirmed') return guests.filter((g) => g.rsvpStatus !== 'confirmed' && g.rsvpStatus !== 'declined').length;
    if (filter === 'declined') return guests.filter((g) => g.rsvpStatus === 'declined').length;
    return guests.length;
  };

  const getFilteredGuests = (filter: string, camp?: EmailCampaign) => {
    if (filter === 'custom' && camp?.customGuestIds) return guests.filter((g) => camp.customGuestIds?.includes(g.id));
    if (filter === 'confirmed') return guests.filter((g) => g.rsvpStatus === 'confirmed');
    if (filter === 'unconfirmed') return guests.filter((g) => g.rsvpStatus !== 'confirmed' && g.rsvpStatus !== 'declined');
    if (filter === 'declined') return guests.filter((g) => g.rsvpStatus === 'declined');
    return guests;
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampTitle.trim()) return;

    addEmailCampaign({
      title: newCampTitle.trim(),
      scheduledDate: new Date().toISOString().slice(0, 10),
      status: 'scheduled',
      recipientFilter: newCampFilter,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
    });

    setNewCampTitle('');
    setShowCreateCamp(false);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmplName.trim() || !tmplSubject.trim()) return;

    if (editingTmplId) {
      updateEmailTemplate(editingTmplId, {
        name: tmplName.trim(),
        subject: tmplSubject.trim(),
        body: tmplBody.trim(),
      });
    } else {
      addEmailTemplate({
        name: tmplName.trim(),
        subject: tmplSubject.trim(),
        body: tmplBody.trim(),
      });
    }

    setShowTmplModal(false);
    setEditingTmplId(null);
    setTmplName('');
    setTmplSubject('');
    setTmplBody('');
  };

  const openEditTemplate = (tmpl: any) => {
    setEditingTmplId(tmpl.id);
    setTmplName(tmpl.name);
    setTmplSubject(tmpl.subject);
    setTmplBody(tmpl.body);
    setShowTmplModal(true);
  };

  // Unified tag replacement — handles BOTH camelCase and snake_case variants
  const replaceTags = (text: string, guestName: string) => {
    const dateStr = wedding.weddingDate
      ? new Date(wedding.weddingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'TBD';
    return text
      // Guest name (both formats)
      .replace(/\{\{guestName\}\}/g, guestName)
      .replace(/\{\{guest_name\}\}/g, guestName)
      // Wedding date
      .replace(/\{\{weddingDate\}\}/g, dateStr)
      .replace(/\{\{wedding_date\}\}/g, dateStr)
      // Venue name
      .replace(/\{\{venueName\}\}/g, wedding.venueName || 'Our Wedding Venue')
      .replace(/\{\{venue_name\}\}/g, wedding.venueName || 'Our Wedding Venue')
      // Partner names
      .replace(/\{\{partner1Name\}\}/g, wedding.partner1Name || 'Partner 1')
      .replace(/\{\{partner1_name\}\}/g, wedding.partner1Name || 'Partner 1')
      .replace(/\{\{partner2Name\}\}/g, wedding.partner2Name || 'Partner 2')
      .replace(/\{\{partner2_name\}\}/g, wedding.partner2Name || 'Partner 2')
      // RSVP link
      .replace(/\{\{rsvp_link\}\}/g, `${window.location.origin}/#rsvp-${wedding.publicShareSlug || wedding.id}`)
      .replace(/\{\{rsvpLink\}\}/g, `${window.location.origin}/#rsvp-${wedding.publicShareSlug || wedding.id}`);
  };

  const formatTemplatePreview = (text: string) => {
    const sampleGuest = guests[0] || { firstName: 'Alex', lastName: 'Johnson' };
    return replaceTags(text, `${sampleGuest.firstName} ${sampleGuest.lastName}`);
  };

  // ZERO-SETUP NATIVE METHODS (No API Keys / No Login Required)
  const handle1ClickBulkMailto = async (campaignId: string) => {
    const camp = emailCampaigns.find((c) => c.id === campaignId);
    if (!camp) return;

    let targetGuests = guests;
    if (camp.recipientFilter === 'custom' && camp.customGuestIds) targetGuests = guests.filter((g) => camp.customGuestIds?.includes(g.id));
    else if (camp.recipientFilter === 'confirmed') targetGuests = guests.filter((g) => g.rsvpStatus === 'confirmed');
    else if (camp.recipientFilter === 'unconfirmed') targetGuests = guests.filter((g) => g.rsvpStatus !== 'confirmed' && g.rsvpStatus !== 'declined');
    else if (camp.recipientFilter === 'declined') targetGuests = guests.filter((g) => g.rsvpStatus === 'declined');
    if (targetGuests.length === 0) targetGuests = guests;

    const emails = targetGuests.map((g) => g.email || `${g.firstName.toLowerCase()}@example.com`).filter(Boolean);
    const tmpl = emailTemplates.find((t) => t.id === selectedTmplId) || emailTemplates[0];
    const baseSubject = tmpl ? tmpl.subject : camp.title;
    const baseBody = tmpl ? tmpl.body : `Please check your guest dashboard for our special wedding details!`;

    const cleanSubject = replaceTags(baseSubject, 'Friends & Family');
    const cleanBody = replaceTags(baseBody, 'Friends & Family');

    // Attempt direct file attachment via Native OS Web Share API
    if (attachmentFile && typeof navigator.canShare === 'function' && navigator.canShare({ files: [attachmentFile] })) {
      try {
        await navigator.share({
          title: cleanSubject,
          text: `${cleanBody}\n\n(BCC: ${emails.join(', ')})`,
          files: [attachmentFile],
        });
        sendCampaignNow(camp.id);
        return;
      } catch (err) {
        // User cancelled share dialog or error, fall back to mailto below
      }
    }

    let attachNote = '';
    if (attachmentFile) {
      attachNote = `\n\n---\n📎 Attachment note: Please attach "${attachmentFile.name}" in your mail client before sending.`;
    }

    const mailtoUrl = `mailto:?bcc=${encodeURIComponent(emails.join(','))}&subject=${encodeURIComponent(cleanSubject)}&body=${encodeURIComponent(cleanBody + attachNote)}`;
    window.open(mailtoUrl, '_self');
    sendCampaignNow(camp.id);
  };

  const handleCopyBccList = (campaignId: string) => {
    const camp = emailCampaigns.find((c) => c.id === campaignId);
    if (!camp) return;
    let targetGuests = guests;
    if (camp.recipientFilter === 'custom' && camp.customGuestIds) targetGuests = guests.filter((g) => camp.customGuestIds?.includes(g.id));
    else if (camp.recipientFilter === 'confirmed') targetGuests = guests.filter((g) => g.rsvpStatus === 'confirmed');
    else if (camp.recipientFilter === 'unconfirmed') targetGuests = guests.filter((g) => g.rsvpStatus !== 'confirmed' && g.rsvpStatus !== 'declined');
    else if (camp.recipientFilter === 'declined') targetGuests = guests.filter((g) => g.rsvpStatus === 'declined');
    if (targetGuests.length === 0) targetGuests = guests;
    const emails = targetGuests.map((g) => g.email || `${g.firstName.toLowerCase()}@example.com`).join(', ');
    navigator.clipboard.writeText(emails);
    alert(`📋 Copied ${targetGuests.length} email addresses to clipboard! You can now paste them into your Gmail or Mail app's BCC box.`);
  };

  const handle1ClickQuickMailto = async () => {
    const targetGuest = guests.find((g) => g.id === quickGuestId) || guests[0];
    if (!targetGuest) return;
    const email = targetGuest.email || `${targetGuest.firstName.toLowerCase()}@example.com`;
    const fullName = `${targetGuest.firstName} ${targetGuest.lastName}`;
    const personalizedSubject = replaceTags(quickSubject, fullName);
    const personalizedBody = replaceTags(quickBody, fullName);

    const resetQuickForm = () => {
      setQuickSubject('We cannot wait to celebrate with you!');
      setQuickBody('Hi there!\n\nJust a quick reminder that our wedding is coming up soon! Please check your guest portal for any dietary or travel updates.\n\nWith love,\nThe Happy Couple');
      removeAttachment();
    };

    // Attempt direct file attachment via Native OS Web Share API
    if (attachmentFile && typeof navigator.canShare === 'function' && navigator.canShare({ files: [attachmentFile] })) {
      try {
        await navigator.share({
          title: personalizedSubject,
          text: `${personalizedBody}\n\n(To: ${email})`,
          files: [attachmentFile],
        });
        setQuickStatusMsg({
          text: `🚀 Native share opened! Select your Mail app to send with "${attachmentFile.name}" attached directly!`,
          isError: false,
        });
        resetQuickForm();
        return;
      } catch (err) {
        // User cancelled share dialog or error, fall back to mailto below
      }
    }

    let attachNote = '';
    if (attachmentFile) {
      attachNote = `\n\n---\n📎 Note: Please attach "${attachmentFile.name}" manually in your email app.`;
    }

    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(personalizedSubject)}&body=${encodeURIComponent(personalizedBody + attachNote)}`;
    window.open(mailtoUrl, '_self');
    setQuickStatusMsg({
      text: `✉️ Opened your mail app for ${fullName}!${attachmentFile ? ` Please attach "${attachmentFile.name}" before sending.` : ''}`,
      isError: false,
    });
    resetQuickForm();
  };



  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-rose-950 via-purple-950/40 to-slate-950 p-6 lg:p-8 rounded-3xl text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-rose-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase px-3 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rose-400 animate-pulse" /> Email Automation Engine
            </span>
          </div>
          <h1 className="font-serif font-bold text-2xl lg:text-3xl tracking-tight text-white flex items-center gap-2.5">
            <Send className="w-7 h-7 text-rose-400" /> Broadcast Studio
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-normal">
            Create email blasts, target guest audiences, and send emails directly from your own mail app — zero setup required.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-2xl text-xs font-semibold border border-slate-800 self-start md:self-center relative z-10 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'campaigns'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Blasts
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Templates
          </button>
          <button
            onClick={() => setActiveTab('instant')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'instant'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Quick Sender
          </button>

        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* TAB 1: EMAIL BLASTS (CAMPAIGNS) */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Active Email Campaigns
              </h2>
              <p className="text-xs text-slate-500">
                Create campaigns and send them instantly via your own mail app — no API keys needed.
              </p>
            </div>
            <button
              onClick={() => setShowCreateCamp(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 flex items-center gap-2 transition-all active:scale-95 shrink-0 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" /> Create New Blast Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emailCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="glass-card rounded-3xl p-6 space-y-4 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between self-start hover:shadow-xl transition-all relative group w-full"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        camp.status === 'sent'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                      }`}
                    >
                      {camp.status === 'sent' ? <Check className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                      {camp.status === 'sent' ? 'Sent' : 'Ready'}
                    </span>
                    <button
                      onClick={() => deleteEmailCampaign(camp.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100 leading-snug">
                    {camp.title}
                  </h3>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedRecipientsCampId(expandedRecipientsCampId === camp.id ? null : camp.id);
                      }}
                      className="flex items-center justify-between w-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors py-1"
                    >
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-rose-500" />
                        <strong className="text-slate-700 dark:text-slate-300 capitalize">
                          {camp.recipientFilter === 'custom' ? 'Selected Custom' : camp.recipientFilter} Guests
                        </strong>
                        <span className="text-[10px] text-slate-400">({getMatchingGuestCount(camp.recipientFilter, camp)})</span>
                      </span>
                      {expandedRecipientsCampId === camp.id ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedRecipientsCampId === camp.id && (
                      <div className="mt-1.5 max-h-36 overflow-y-auto rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 divide-y divide-slate-100 dark:divide-slate-800 animate-fade-in">
                        {getFilteredGuests(camp.recipientFilter, camp).length === 0 ? (
                          <p className="text-[11px] text-slate-400 p-3 text-center">No matching guests found.</p>
                        ) : (
                          getFilteredGuests(camp.recipientFilter, camp).map((g) => (
                            <div key={g.id} className="flex items-center justify-between px-3 py-2 text-[11px]">
                              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                                {g.firstName} {g.lastName}
                              </span>
                              <span className="text-slate-400 truncate ml-2 text-[10px] font-mono">
                                {g.email || `${g.firstName.toLowerCase()}@example.com`}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {camp.status === 'sent' ? (
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center text-xs border border-slate-200/50 dark:border-slate-700/50">
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-slate-100 text-sm">
                        {camp.sentCount}
                      </span>
                      <span className="text-[10px] text-slate-400">Recipients</span>
                    </div>
                    <div>
                      <span className="font-bold block text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-0.5 text-sm">
                        <Eye className="w-3.5 h-3.5" /> {camp.openRate}%
                      </span>
                      <span className="text-[10px] text-slate-400">Open Rate</span>
                    </div>
                    <div>
                      <span className="font-bold block text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-0.5 text-sm">
                        <MousePointer className="w-3.5 h-3.5" /> {camp.clickRate}%
                      </span>
                      <span className="text-[10px] text-slate-400">Click Rate</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handle1ClickBulkMailto(camp.id)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
                      title="Opens Gmail, Apple Mail, or Outlook with all matching guests in BCC, ready to send instantly!"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email Now
                    </button>
                    <button
                      onClick={() => handleCopyBccList(camp.id)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                      title="Copy all matching guest email addresses to clipboard to paste into Gmail or webmail"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy All Emails to Clipboard
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB 2: TEMPLATE STUDIO */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
                Email Wording Templates
              </h2>
              <p className="text-xs text-slate-500">
                Use tags like <code className="text-rose-500 font-mono">{'{{guestName}}'}</code>,{' '}
                <code className="text-rose-500 font-mono">{'{{weddingDate}}'}</code>,{' '}
                <code className="text-rose-500 font-mono">{'{{rsvpLink}}'}</code> for auto-fill.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingTmplId(null);
                setTmplName('');
                setTmplSubject('');
                setTmplBody('');
                setShowTmplModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Create Custom Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {emailTemplates.map((tmpl) => {
              const isPreview = previewModeId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  className="glass-panel rounded-3xl p-6 space-y-4 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-lg text-rose-600 dark:text-rose-400">
                        {tmpl.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewModeId(isPreview ? null : tmpl.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                            isPreview
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                          title="Toggle Live Merge Preview"
                        >
                          <Eye className="w-3 h-3" /> {isPreview ? 'Original Code' : 'Preview Live'}
                        </button>
                        <button
                          onClick={() => openEditTemplate(tmpl)}
                          className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg"
                          title="Edit Template"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEmailTemplate(tmpl.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 space-y-2">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Subject: {isPreview ? formatTemplatePreview(tmpl.subject) : tmpl.subject}
                      </p>
                      <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                        <pre className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                          {isPreview ? formatTemplatePreview(tmpl.body) : tmpl.body}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                    <span>Personalized tags auto-merged at send time</span>
                    <button
                      onClick={() => {
                        setNewCampTitle(`Blast: ${tmpl.name}`);
                        setSelectedTmplId(tmpl.id);
                        setShowCreateCamp(true);
                      }}
                      className="text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                    >
                      Use for Blast <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB 3: INSTANT TEST SENDER (QUICK BLAST) */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'instant' && (
        <div className="max-w-2xl mx-auto glass-card rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" /> Quick Email Dispatcher
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Test your email system by firing an immediate single email to any guest on your list.
            </p>
          </div>

          {quickStatusMsg && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-center justify-between animate-fade-in ${
                quickStatusMsg.isError
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              }`}
            >
              <span className="flex items-center gap-2 font-semibold">
                {quickStatusMsg.isError ? (
                  <CheckCircle2 className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {quickStatusMsg.text}
              </span>
              <button onClick={() => setQuickStatusMsg(null)}>✕</button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Recipient Guest
              </label>
              <select
                value={quickGuestId}
                onChange={(e) => setQuickGuestId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500 font-semibold"
              >
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.firstName} {g.lastName} — ({g.email || `${g.firstName.toLowerCase()}@example.com`}) [{g.rsvpStatus}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Subject Line
              </label>
              <input
                type="text"
                value={quickSubject}
                onChange={(e) => setQuickSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Message Body
              </label>
              <textarea
                rows={5}
                value={quickBody}
                onChange={(e) => setQuickBody(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500 font-sans leading-relaxed"
              />
            </div>

            {/* Attachment Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                📎 Attach a File (optional)
              </label>
              {attachmentFile ? (
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 text-xs text-indigo-800 dark:text-indigo-200 font-semibold truncate">
                    <Paperclip className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate">{attachmentFile.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">({(attachmentFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {attachmentUrl && (
                      <a href={attachmentUrl} download={attachmentFile.name} className="p-1.5 rounded-lg hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 text-indigo-500" title="Download file">
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button onClick={removeAttachment} className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-500" title="Remove attachment">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-500 dark:text-slate-400 text-xs font-semibold cursor-pointer transition-colors hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20">
                  <Paperclip className="w-4 h-4" />
                  Click to attach invitation, map, or any file
                  <input type="file" className="hidden" onChange={handleAttachmentChange} />
                </label>
              )}
              {attachmentFile && (
                <div className="text-[10px] mt-1.5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>Ready to attach:</strong> Clicking send will open your share menu to attach "{attachmentFile.name}" directly!</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handle1ClickQuickMailto}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Mail className="w-4 h-4" />
              Send Email Now
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 1: CREATE NEW CAMPAIGN */}
      {/* ------------------------------------------------------------------------- */}
      {showCreateCamp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-500" /> Create Email Blast
              </h3>
              <button onClick={() => setShowCreateCamp(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 2 Weeks Until Our Wedding Reminder!"
                  value={newCampTitle}
                  onChange={(e) => setNewCampTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience Filter
                </label>
                <select
                  value={newCampFilter}
                  onChange={(e: any) => setNewCampFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-rose-500 font-semibold"
                >
                  <option value="all">All Guests ({getMatchingGuestCount('all')} recipients)</option>
                  <option value="confirmed">Confirmed / Attending Only ({getMatchingGuestCount('confirmed')} recipients)</option>
                  <option value="unconfirmed">Pending RSVPs Only ({getMatchingGuestCount('unconfirmed')} recipients)</option>
                  <option value="declined">Declined Guests ({getMatchingGuestCount('declined')} recipients)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Wording Template
                </label>
                <select
                  value={selectedTmplId}
                  onChange={(e) => setSelectedTmplId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-rose-500 font-semibold"
                >
                  {emailTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — ({t.subject})
                    </option>
                  ))}
                </select>
              </div>


              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateCamp(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-md shadow-rose-500/20"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 2: TEMPLATE CREATOR / EDITOR */}
      {/* ------------------------------------------------------------------------- */}
      {showTmplModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                {editingTmplId ? 'Edit Email Template' : 'Create Custom Template'}
              </h3>
              <button onClick={() => setShowTmplModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Hotel Block Discount Info"
                  value={tmplName}
                  onChange={(e) => setTmplName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Important info for {{guestName}} regarding hotels!"
                  value={tmplSubject}
                  onChange={(e) => setTmplSubject(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Wording Body
                  </label>
                  <div className="flex items-center gap-1 text-[10px] flex-wrap">
                    <span className="text-slate-400">Insert Tag:</span>
                    <button
                      type="button"
                      onClick={() => setTmplBody((prev) => prev + '{{guestName}}')}
                      className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-rose-500 font-mono font-bold hover:bg-slate-200"
                    >
                      + Guest
                    </button>
                    <button
                      type="button"
                      onClick={() => setTmplBody((prev) => prev + '{{weddingDate}}')}
                      className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-rose-500 font-mono font-bold hover:bg-slate-200"
                    >
                      + Date
                    </button>
                    <button
                      type="button"
                      onClick={() => setTmplBody((prev) => prev + '{{venueName}}')}
                      className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-rose-500 font-mono font-bold hover:bg-slate-200"
                    >
                      + Venue
                    </button>
                    <button
                      type="button"
                      onClick={() => setTmplBody((prev) => prev + '{{partner1Name}}')}
                      className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-500 font-mono font-bold hover:bg-slate-200"
                    >
                      + P1
                    </button>
                    <button
                      type="button"
                      onClick={() => setTmplBody((prev) => prev + '{{partner2Name}}')}
                      className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-500 font-mono font-bold hover:bg-slate-200"
                    >
                      + P2
                    </button>
                    <button
                      type="button"
                      onClick={() => setTmplBody((prev) => prev + '\n\nUpdate your RSVP here:\n{{rsvpLink}}')}
                      className="bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-400 font-mono font-bold hover:bg-amber-200"
                    >
                      + RSVP Link
                    </button>
                  </div>
                </div>
                <textarea
                  rows={6}
                  required
                  placeholder="Dear {{guestName}},&#10;&#10;We are delighted to invite you..."
                  value={tmplBody}
                  onChange={(e) => setTmplBody(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTmplModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20"
                >
                  {editingTmplId ? 'Update Template' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

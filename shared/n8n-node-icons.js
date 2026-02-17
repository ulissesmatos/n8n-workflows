/**
 * n8n Node Icon Map
 * -----------------
 * Provides SVG icons for n8n workflow nodes. Works in both browser (WordPress
 * plugin, vanilla JS) and Node.js (CommonJS).
 *
 * Browser usage:
 *   <script src="n8n-node-icons.js"></script>
 *   N8nNodeIcons.getNodeIcon('n8n-nodes-base.openAi')
 *   N8nNodeIcons.renderBadges(workflowJson, { max: 6, size: 20 })
 *
 * Node.js usage:
 *   const N = require('./n8n-node-icons.js');
 *   N.getNodeIcon('n8n-nodes-base.openAi')
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.N8nNodeIcons = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Helper: Simple Icons CDN image (brand icons)
  function si(slug, color) {
    var hex = color.replace('#', '');
    return '<img src="https://cdn.simpleicons.org/' + slug + '/' + hex + '" width="12" height="12" style="display:block"/>';
  }

  // Helper: custom stroke-based SVG (utility/internal nodes)
  function custom(inner, color) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }

  // ---- Brand / Platform icons (Simple Icons CDN) ----
  var BRANDS = {
    google:        { slug: 'google',           color: '#4285F4' },
    googleSheets:  { slug: 'googlesheets',     color: '#0F9D58' },
    googleDrive:   { slug: 'googledrive',      color: '#4285F4' },
    googleCalendar:{ slug: 'googlecalendar',   color: '#4285F4' },
    gmail:         { slug: 'gmail',            color: '#EA4335' },
    openai:        { slug: 'openai',           color: '#412991' },
    discord:       { slug: 'discord',          color: '#5865F2' },
    slack:         { slug: 'slack',            color: '#4A154B' },
    telegram:      { slug: 'telegram',         color: '#26A5E4' },
    github:        { slug: 'github',           color: '#181717' },
    microsoft:     { slug: 'microsoft',        color: '#5E5E5E' },
    notion:        { slug: 'notion',           color: '#000000' },
    airtable:      { slug: 'airtable',         color: '#18BFFF' },
    stripe:        { slug: 'stripe',           color: '#635BFF' },
    twilio:        { slug: 'twilio',           color: '#F22F46' },
    shopify:       { slug: 'shopify',          color: '#7AB55C' },
    wordpress:     { slug: 'wordpress',        color: '#21759B' },
    jira:          { slug: 'jira',             color: '#0052CC' },
    trello:        { slug: 'trello',           color: '#0052CC' },
    asana:         { slug: 'asana',            color: '#F06A6A' },
    dropbox:       { slug: 'dropbox',          color: '#0061FF' },
    aws:           { slug: 'amazonaws',        color: '#232F3E' },
    supabase:      { slug: 'supabase',         color: '#3ECF8E' },
    firebase:      { slug: 'firebase',         color: '#FFCA28' },
    mongodb:       { slug: 'mongodb',          color: '#47A248' },
    mysql:         { slug: 'mysql',            color: '#4479A1' },
    postgresql:    { slug: 'postgresql',       color: '#336791' },
    postgres:      { slug: 'postgresql',       color: '#336791' },
    redis:         { slug: 'redis',            color: '#DC382D' },
    salesforce:    { slug: 'salesforce',       color: '#00A1E0' },
    hubspot:       { slug: 'hubspot',          color: '#FF7A59' },
    mailchimp:     { slug: 'mailchimp',        color: '#FFE01B' },
    sendgrid:      { slug: 'sendgrid',         color: '#51A9E3' },
    zendesk:       { slug: 'zendesk',          color: '#03363D' },
    intercom:      { slug: 'intercom',         color: '#6AFDEF' },
    webflow:       { slug: 'webflow',          color: '#4353FF' },
    figma:         { slug: 'figma',            color: '#F24E1E' },
    x:             { slug: 'x',               color: '#000000' },
    facebook:      { slug: 'facebook',         color: '#0866FF' },
    linkedin:      { slug: 'linkedin',         color: '#0A66C2' },
    youtube:       { slug: 'youtube',          color: '#FF0000' },
    whatsapp:      { slug: 'whatsapp',         color: '#25D366' },
    zoom:          { slug: 'zoom',             color: '#0B5CFF' },
    spotify:       { slug: 'spotify',          color: '#1DB954' },
    anthropic:     { slug: 'anthropic',        color: '#D97757' },
    zapier:        { slug: 'zapier',           color: '#FF4A00' },
    n8n:           { slug: 'n8n',              color: '#EA4B71' },
    excel:         { slug: 'microsoftexcel',   color: '#217346' },
    outlook:       { slug: 'microsoftoutlook', color: '#0078D4' },
    wikipedia:     { slug: 'wikipedia',        color: '#000000' },
    openrouter:    { slug: 'openrouter',       color: '#6366F1' },
    pipedrive:     { slug: 'pipedrive',        color: '#017737' },
    typeform:      { slug: 'typeform',         color: '#262627' },
    mattermost:    { slug: 'mattermost',       color: '#0058CC' },
  };

  function resolveBrand(key) {
    var b = BRANDS[key];
    if (!b) return null;
    return { svg: si(b.slug, b.color), color: b.color, label: key.charAt(0).toUpperCase() + key.slice(1) };
  }

  // ---- n8n Internal / Utility Nodes (custom SVGs) ----
  var N8N_INTERNAL = {
    code:             { svg: custom('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', '#607D8B'), color: '#607D8B', label: 'Code' },
    set:              { svg: custom('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>', '#FF6D5A'), color: '#FF6D5A', label: 'Edit Fields' },
    editFields:       { svg: custom('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>', '#FF6D5A'), color: '#FF6D5A', label: 'Edit Fields' },
    if:               { svg: custom('<path d="M16 3h5v5"/><path d="M8 3H3v5"/><line x1="12" y1="22" x2="12" y2="12"/><path d="m21 3-9 9"/><path d="M3 3l9 9"/>', '#F4A261'), color: '#F4A261', label: 'IF' },
    switch:           { svg: custom('<path d="M18 8L22 12L18 16"/><path d="M2 12H22"/><path d="M6 3L2 7L6 11"/><path d="M22 7H2"/>', '#8B5CF6'), color: '#8B5CF6', label: 'Switch' },
    merge:            { svg: custom('<path d="M8 6L12 12L8 18"/><path d="M16 6L12 12L16 18"/>', '#06B6D4'), color: '#06B6D4', label: 'Merge' },
    splitInBatches:   { svg: custom('<rect x="3" y="3" width="18" height="6" rx="1"/><rect x="3" y="15" width="7" height="6" rx="1"/><rect x="14" y="15" width="7" height="6" rx="1"/>', '#0891B2'), color: '#0891B2', label: 'Split In Batches' },
    wait:             { svg: custom('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', '#F59E0B'), color: '#F59E0B', label: 'Wait' },
    scheduleTrigger:  { svg: custom('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><path d="M5 3L2 6"/><path d="M19 3L22 6"/>', '#10B981'), color: '#10B981', label: 'Schedule Trigger' },
    manualTrigger:    { svg: custom('<path d="M15 4V2a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2"/><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="12" y1="10" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/>', '#6366F1'), color: '#6366F1', label: 'Manual Trigger' },
    webhookTrigger:   { svg: custom('<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 8v4l3 3"/>', '#6E42C1'), color: '#6E42C1', label: 'Webhook' },
    httpRequest:      { svg: custom('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', '#6E42C1'), color: '#6E42C1', label: 'HTTP Request' },
    stickyNote:       { svg: custom('<path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"/><polyline points="14 3 14 9 21 9"/>', '#FBBF24'), color: '#FBBF24', label: 'Sticky Note' },
    noOp:             { svg: custom('<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>', '#94A3B8'), color: '#94A3B8', label: 'No Operation' },
    function:         { svg: custom('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', '#607D8B'), color: '#607D8B', label: 'Function' },
    executeCommand:   { svg: custom('<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>', '#475569'), color: '#475569', label: 'Execute Command' },
    readBinaryFile:   { svg: custom('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>', '#64748B'), color: '#64748B', label: 'Read Binary File' },
    writeBinaryFile:  { svg: custom('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/>', '#64748B'), color: '#64748B', label: 'Write Binary File' },
    moveBinaryData:   { svg: custom('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/>', '#64748B'), color: '#64748B', label: 'Move Binary Data' },
    crypto:           { svg: custom('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', '#374151'), color: '#374151', label: 'Crypto' },
    dateTime:         { svg: custom('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', '#F472B6'), color: '#F472B6', label: 'Date & Time' },
    errorTrigger:     { svg: custom('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>', '#EF4444'), color: '#EF4444', label: 'Error Trigger' },
    start:            { svg: custom('<polygon points="5 3 19 12 5 21 5 3"/>', '#22C55E'), color: '#22C55E', label: 'Start' },
    stopAndError:     { svg: custom('<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/>', '#EF4444'), color: '#EF4444', label: 'Stop and Error' },
    respondToWebhook: { svg: custom('<polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>', '#8B5CF6'), color: '#8B5CF6', label: 'Respond to Webhook' },
    executeWorkflow:  { svg: custom('<polygon points="5 3 19 12 5 21 5 3"/><line x1="19" y1="3" x2="19" y2="21"/>', '#3B82F6'), color: '#3B82F6', label: 'Execute Workflow' },
    itemLists:        { svg: custom('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>', '#7C3AED'), color: '#7C3AED', label: 'Item Lists' },
    html:             { svg: custom('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', '#E34F26'), color: '#E34F26', label: 'HTML' },
    xml:              { svg: custom('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', '#F57C00'), color: '#F57C00', label: 'XML' },
    rssFeedRead:      { svg: custom('<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>', '#F97316'), color: '#F97316', label: 'RSS Feed Read' },
    emailSend:        { svg: custom('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>', '#EA4335'), color: '#EA4335', label: 'Email' },
    spreadsheetFile:  { svg: custom('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>', '#0F9D58'), color: '#0F9D58', label: 'Spreadsheet File' },
    compareDatasets:  { svg: custom('<rect x="2" y="3" width="8" height="18" rx="1"/><rect x="14" y="3" width="8" height="18" rx="1"/><path d="M10 12h4"/>', '#6366F1'), color: '#6366F1', label: 'Compare Datasets' },
    formTrigger:      { svg: custom('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/><rect x="7" y="15" width="4" height="2" rx="1"/>', '#FF6D5A'), color: '#FF6D5A', label: 'Form Trigger' },
    form:             { svg: custom('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/><polyline points="9 16 11 18 15 14"/>', '#FF6D5A'), color: '#FF6D5A', label: 'Form' },
    splitOut:         { svg: custom('<line x1="4" y1="12" x2="10" y2="12"/><polyline points="14 6 20 6"/><polyline points="14 12 20 12"/><polyline points="14 18 20 18"/><polyline points="10 12 14 6"/><polyline points="10 12 14 18"/>', '#0891B2'), color: '#0891B2', label: 'Split Out' },
    agent:            { svg: custom('<circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>', '#8B5CF6'), color: '#8B5CF6', label: 'AI Agent' },
    lmChat:           { svg: custom('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="10" r="1"/><circle cx="16" cy="10" r="1"/>', '#6366F1'), color: '#6366F1', label: 'Chat Model' },
    tool:             { svg: custom('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>', '#78716C'), color: '#78716C', label: 'Tool' },
    memory:           { svg: custom('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 2v4"/><path d="M18 2v4"/><path d="M2 10h20"/><path d="M7 14h2"/><path d="M11 14h6"/>', '#A855F7'), color: '#A855F7', label: 'Memory' },
    outputParser:     { svg: custom('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/>', '#EC4899'), color: '#EC4899', label: 'Output Parser' },
    chain:            { svg: custom('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>', '#F59E0B'), color: '#F59E0B', label: 'Chain' },
    textClassifier:   { svg: custom('<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>', '#3B82F6'), color: '#3B82F6', label: 'Text Classifier' },
    summarizationChain: { svg: custom('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>', '#10B981'), color: '#10B981', label: 'Summarization' },
    vectorStore:      { svg: custom('<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6"/><path d="M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6"/>', '#06B6D4'), color: '#06B6D4', label: 'Vector Store' },
    embeddings:       { svg: custom('<circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><line x1="6" y1="9" x2="6" y2="15"/><line x1="18" y1="9" x2="18" y2="15"/><line x1="9" y1="6" x2="15" y2="6"/><line x1="9" y1="18" x2="15" y2="18"/>', '#8B5CF6'), color: '#8B5CF6', label: 'Embeddings' },
    documentLoader:   { svg: custom('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15l3-3 3 3"/>', '#F97316'), color: '#F97316', label: 'Document Loader' },
    textSplitter:     { svg: custom('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="4" y1="12" x2="20" y2="12"/>', '#64748B'), color: '#64748B', label: 'Text Splitter' },
    retriever:        { svg: custom('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>', '#06B6D4'), color: '#06B6D4', label: 'Retriever' },
    informationExtractor: { svg: custom('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v6"/><path d="M8 11h6"/>', '#3B82F6'), color: '#3B82F6', label: 'Information Extractor' },
    questionAnswer:   { svg: custom('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>', '#6366F1'), color: '#6366F1', label: 'Q&A Chain' },
    sentimentAnalysis:{ svg: custom('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>', '#F59E0B'), color: '#F59E0B', label: 'Sentiment Analysis' },
  };

  // ---- Node-type → Icon key mapping ----
  var TYPE_MAP = {
    'n8n-nodes-base.code': 'code',
    'n8n-nodes-base.set': 'set',
    'n8n-nodes-base.editFields': 'editFields',
    'n8n-nodes-base.if': 'if',
    'n8n-nodes-base.switch': 'switch',
    'n8n-nodes-base.merge': 'merge',
    'n8n-nodes-base.splitInBatches': 'splitInBatches',
    'n8n-nodes-base.wait': 'wait',
    'n8n-nodes-base.scheduleTrigger': 'scheduleTrigger',
    'n8n-nodes-base.manualTrigger': 'manualTrigger',
    'n8n-nodes-base.webhook': 'webhookTrigger',
    'n8n-nodes-base.httpRequest': 'httpRequest',
    'n8n-nodes-base.stickyNote': 'stickyNote',
    'n8n-nodes-base.noOp': 'noOp',
    'n8n-nodes-base.function': 'function',
    'n8n-nodes-base.functionItem': 'function',
    'n8n-nodes-base.executeCommand': 'executeCommand',
    'n8n-nodes-base.readBinaryFile': 'readBinaryFile',
    'n8n-nodes-base.readBinaryFiles': 'readBinaryFile',
    'n8n-nodes-base.writeBinaryFile': 'writeBinaryFile',
    'n8n-nodes-base.moveBinaryData': 'moveBinaryData',
    'n8n-nodes-base.crypto': 'crypto',
    'n8n-nodes-base.dateTime': 'dateTime',
    'n8n-nodes-base.errorTrigger': 'errorTrigger',
    'n8n-nodes-base.start': 'start',
    'n8n-nodes-base.stopAndError': 'stopAndError',
    'n8n-nodes-base.respondToWebhook': 'respondToWebhook',
    'n8n-nodes-base.executeWorkflow': 'executeWorkflow',
    'n8n-nodes-base.executeWorkflowTrigger': 'executeWorkflow',
    'n8n-nodes-base.itemLists': 'itemLists',
    'n8n-nodes-base.html': 'html',
    'n8n-nodes-base.xml': 'xml',
    'n8n-nodes-base.rssFeedRead': 'rssFeedRead',
    'n8n-nodes-base.emailSend': 'emailSend',
    'n8n-nodes-base.emailReadImap': 'emailSend',
    'n8n-nodes-base.spreadsheetFile': 'spreadsheetFile',
    'n8n-nodes-base.compareDatasets': 'compareDatasets',
    'n8n-nodes-base.n8n': 'n8n',
    'n8n-nodes-base.openAi': 'openai',
    '@n8n/n8n-nodes-langchain.openAi': 'openai',
    '@n8n/n8n-nodes-langchain.lmChatOpenAi': 'openai',
    '@n8n/n8n-nodes-langchain.lmOpenAi': 'openai',
    'n8n-nodes-base.discord': 'discord',
    'n8n-nodes-base.discordTrigger': 'discord',
    'n8n-nodes-base.slack': 'slack',
    'n8n-nodes-base.slackTrigger': 'slack',
    'n8n-nodes-base.telegram': 'telegram',
    'n8n-nodes-base.telegramTrigger': 'telegram',
    'n8n-nodes-base.github': 'github',
    'n8n-nodes-base.githubTrigger': 'github',
    'n8n-nodes-base.googleSheets': 'googleSheets',
    'n8n-nodes-base.googleSheetsTrigger': 'googleSheets',
    'n8n-nodes-base.googleDrive': 'googleDrive',
    'n8n-nodes-base.googleDriveTrigger': 'googleDrive',
    'n8n-nodes-base.googleCalendar': 'googleCalendar',
    'n8n-nodes-base.googleCalendarTrigger': 'googleCalendar',
    'n8n-nodes-base.gmail': 'gmail',
    'n8n-nodes-base.gmailTrigger': 'gmail',
    'n8n-nodes-base.notion': 'notion',
    'n8n-nodes-base.notionTrigger': 'notion',
    'n8n-nodes-base.airtable': 'airtable',
    'n8n-nodes-base.airtableTrigger': 'airtable',
    'n8n-nodes-base.stripe': 'stripe',
    'n8n-nodes-base.stripeTrigger': 'stripe',
    'n8n-nodes-base.twilio': 'twilio',
    'n8n-nodes-base.shopify': 'shopify',
    'n8n-nodes-base.shopifyTrigger': 'shopify',
    'n8n-nodes-base.wordpress': 'wordpress',
    'n8n-nodes-base.jira': 'jira',
    'n8n-nodes-base.jiraTrigger': 'jira',
    'n8n-nodes-base.trello': 'trello',
    'n8n-nodes-base.trelloTrigger': 'trello',
    'n8n-nodes-base.asana': 'asana',
    'n8n-nodes-base.asanaTrigger': 'asana',
    'n8n-nodes-base.dropbox': 'dropbox',
    'n8n-nodes-base.microsoftExcel': 'excel',
    'n8n-nodes-base.microsoftOutlook': 'outlook',
    'n8n-nodes-base.microsoftOneDrive': 'microsoft',
    'n8n-nodes-base.microsoftTeams': 'microsoft',
    'n8n-nodes-base.microsoftToDo': 'microsoft',
    'n8n-nodes-base.awsS3': 'aws',
    'n8n-nodes-base.awsSes': 'aws',
    'n8n-nodes-base.awsSns': 'aws',
    'n8n-nodes-base.awsLambda': 'aws',
    'n8n-nodes-base.awsDynamoDb': 'aws',
    'n8n-nodes-base.supabase': 'supabase',
    'n8n-nodes-base.firebase': 'firebase',
    'n8n-nodes-base.mongoDb': 'mongodb',
    'n8n-nodes-base.mySql': 'mysql',
    'n8n-nodes-base.postgres': 'postgresql',
    'n8n-nodes-base.redis': 'redis',
    'n8n-nodes-base.salesforce': 'salesforce',
    'n8n-nodes-base.hubspot': 'hubspot',
    'n8n-nodes-base.hubspotTrigger': 'hubspot',
    'n8n-nodes-base.mailchimp': 'mailchimp',
    'n8n-nodes-base.mailchimpTrigger': 'mailchimp',
    'n8n-nodes-base.sendGrid': 'sendgrid',
    'n8n-nodes-base.zendesk': 'zendesk',
    'n8n-nodes-base.zendeskTrigger': 'zendesk',
    'n8n-nodes-base.intercom': 'intercom',
    'n8n-nodes-base.webflow': 'webflow',
    'n8n-nodes-base.webflowTrigger': 'webflow',
    'n8n-nodes-base.figma': 'figma',
    'n8n-nodes-base.twitter': 'x',
    'n8n-nodes-base.facebookGraphApi': 'facebook',
    'n8n-nodes-base.linkedIn': 'linkedin',
    'n8n-nodes-base.youTube': 'youtube',
    'n8n-nodes-base.whatsApp': 'whatsapp',
    'n8n-nodes-base.zoom': 'zoom',
    'n8n-nodes-base.spotify': 'spotify',
    'n8n-nodes-base.zapier': 'zapier',
    '@n8n/n8n-nodes-langchain.lmChatAnthropic': 'anthropic',
    '@n8n/n8n-nodes-langchain.lmAnthropic': 'anthropic',
    'n8n-nodes-base.formTrigger': 'formTrigger',
    'n8n-nodes-base.form': 'form',
    'n8n-nodes-base.splitOut': 'splitOut',
    'n8n-nodes-base.removeDuplicates': 'itemLists',
    'n8n-nodes-base.sort': 'itemLists',
    'n8n-nodes-base.limit': 'itemLists',
    'n8n-nodes-base.aggregate': 'itemLists',
    'n8n-nodes-base.summarize': 'itemLists',
    'n8n-nodes-base.filter': 'if',
    '@n8n/n8n-nodes-langchain.agent': 'agent',
    '@n8n/n8n-nodes-langchain.chainRetrievalQa': 'questionAnswer',
    '@n8n/n8n-nodes-langchain.chainSummarization': 'summarizationChain',
    '@n8n/n8n-nodes-langchain.chainLlm': 'chain',
    '@n8n/n8n-nodes-langchain.chain': 'chain',
    '@n8n/n8n-nodes-langchain.textClassifier': 'textClassifier',
    '@n8n/n8n-nodes-langchain.sentimentAnalysis': 'sentimentAnalysis',
    '@n8n/n8n-nodes-langchain.informationExtractor': 'informationExtractor',
    '@n8n/n8n-nodes-langchain.lmChatOpenRouter': 'openrouter',
    '@n8n/n8n-nodes-langchain.lmChatOllama': 'lmChat',
    '@n8n/n8n-nodes-langchain.lmChatGroq': 'lmChat',
    '@n8n/n8n-nodes-langchain.lmChatMistralCloud': 'lmChat',
    '@n8n/n8n-nodes-langchain.lmChatGoogleVertex': 'google',
    '@n8n/n8n-nodes-langchain.lmChatGoogleGemini': 'google',
    '@n8n/n8n-nodes-langchain.lmChatAzureOpenAi': 'microsoft',
    '@n8n/n8n-nodes-langchain.lmChatHuggingFace': 'lmChat',
    '@n8n/n8n-nodes-langchain.lmChatAwsBedrock': 'aws',
    '@n8n/n8n-nodes-langchain.lmCohere': 'lmChat',
    '@n8n/n8n-nodes-langchain.toolWikipedia': 'wikipedia',
    '@n8n/n8n-nodes-langchain.toolCalculator': 'tool',
    '@n8n/n8n-nodes-langchain.toolCode': 'code',
    '@n8n/n8n-nodes-langchain.toolHttpRequest': 'httpRequest',
    '@n8n/n8n-nodes-langchain.toolSerpApi': 'tool',
    '@n8n/n8n-nodes-langchain.toolWolframAlpha': 'tool',
    '@n8n/n8n-nodes-langchain.toolWorkflow': 'executeWorkflow',
    '@n8n/n8n-nodes-langchain.toolVectorStore': 'vectorStore',
    '@n8n/n8n-nodes-langchain.memoryBufferWindow': 'memory',
    '@n8n/n8n-nodes-langchain.memoryMotorhead': 'memory',
    '@n8n/n8n-nodes-langchain.memoryRedis': 'redis',
    '@n8n/n8n-nodes-langchain.memoryPostgresChat': 'postgresql',
    '@n8n/n8n-nodes-langchain.memoryXata': 'memory',
    '@n8n/n8n-nodes-langchain.memoryZep': 'memory',
    '@n8n/n8n-nodes-langchain.outputParserStructured': 'outputParser',
    '@n8n/n8n-nodes-langchain.outputParserAutofixing': 'outputParser',
    '@n8n/n8n-nodes-langchain.outputParserItemList': 'outputParser',
    '@n8n/n8n-nodes-langchain.vectorStoreInMemory': 'vectorStore',
    '@n8n/n8n-nodes-langchain.vectorStorePinecone': 'vectorStore',
    '@n8n/n8n-nodes-langchain.vectorStoreQdrant': 'vectorStore',
    '@n8n/n8n-nodes-langchain.vectorStoreSupabase': 'supabase',
    '@n8n/n8n-nodes-langchain.vectorStoreZep': 'vectorStore',
    '@n8n/n8n-nodes-langchain.vectorStorePgVector': 'postgresql',
    '@n8n/n8n-nodes-langchain.embeddingsOpenAi': 'openai',
    '@n8n/n8n-nodes-langchain.embeddingsAzureOpenAi': 'microsoft',
    '@n8n/n8n-nodes-langchain.embeddingsCohere': 'embeddings',
    '@n8n/n8n-nodes-langchain.embeddingsHuggingFaceInference': 'embeddings',
    '@n8n/n8n-nodes-langchain.embeddingsGoogleVertex': 'google',
    '@n8n/n8n-nodes-langchain.embeddingsGoogleGemini': 'google',
    '@n8n/n8n-nodes-langchain.embeddingsOllama': 'embeddings',
    '@n8n/n8n-nodes-langchain.embeddingsMistralCloud': 'embeddings',
    '@n8n/n8n-nodes-langchain.documentDefaultDataLoader': 'documentLoader',
    '@n8n/n8n-nodes-langchain.documentGithubLoader': 'github',
    '@n8n/n8n-nodes-langchain.documentJsonLoader': 'documentLoader',
    '@n8n/n8n-nodes-langchain.documentBinaryInputLoader': 'documentLoader',
    '@n8n/n8n-nodes-langchain.textSplitterCharacter': 'textSplitter',
    '@n8n/n8n-nodes-langchain.textSplitterRecursiveCharacter': 'textSplitter',
    '@n8n/n8n-nodes-langchain.textSplitterTokenSplitter': 'textSplitter',
    '@n8n/n8n-nodes-langchain.retrieverContextualCompression': 'retriever',
    '@n8n/n8n-nodes-langchain.retrieverMultiQuery': 'retriever',
    '@n8n/n8n-nodes-langchain.retrieverVectorStore': 'retriever',
    '@n8n/n8n-nodes-langchain.retrieverWorkflow': 'retriever',
    'n8n-nodes-base.pipedrive': 'pipedrive',
    'n8n-nodes-base.pipedriveTrigger': 'pipedrive',
    'n8n-nodes-base.typeform': 'typeform',
    'n8n-nodes-base.typeformTrigger': 'typeform',
    'n8n-nodes-base.mattermost': 'mattermost',
  };

  // ---- Icon resolution helpers ----
  function makeDefaultIcon(label) {
    var displayLabel = label || 'Unknown';
    var letter = displayLabel.charAt(0).toUpperCase();
    var color = '#94A3B8';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
      '<circle cx="12" cy="12" r="11" fill="' + color + '" opacity="0.15"/>' +
      '<circle cx="12" cy="12" r="11" fill="none" stroke="' + color + '" stroke-width="1.5"/>' +
      '<text x="12" y="16.5" text-anchor="middle" fill="' + color + '" font-size="13" font-weight="600" font-family="system-ui,sans-serif">' + letter + '</text>' +
      '</svg>';
    return { svg: svg, color: color, label: displayLabel };
  }

  function resolveIcon(key) {
    if (N8N_INTERNAL[key]) return N8N_INTERNAL[key];
    return resolveBrand(key);
  }

  function guessKeyFromType(nodeType) {
    if (!nodeType) return null;
    var parts = nodeType.split('.');
    var raw = parts[parts.length - 1];

    if (N8N_INTERNAL[raw]) return raw;
    if (BRANDS[raw]) return raw;

    var lower = raw.toLowerCase();
    var allKeys = Object.keys(BRANDS).concat(Object.keys(N8N_INTERNAL));
    for (var i = 0; i < allKeys.length; i++) {
      if (allKeys[i].toLowerCase() === lower) return allKeys[i];
    }

    var withoutTrigger = raw.replace(/Trigger$/i, '');
    if (N8N_INTERNAL[withoutTrigger]) return withoutTrigger;
    if (BRANDS[withoutTrigger]) return withoutTrigger;
    var withoutTriggerLower = withoutTrigger.toLowerCase();
    for (var j = 0; j < allKeys.length; j++) {
      if (allKeys[j].toLowerCase() === withoutTriggerLower) return allKeys[j];
    }

    var langchainPrefixes = [
      { prefix: 'lmChat', key: 'lmChat' },
      { prefix: 'lm', key: 'lmChat' },
      { prefix: 'tool', key: 'tool' },
      { prefix: 'memory', key: 'memory' },
      { prefix: 'embeddings', key: 'embeddings' },
      { prefix: 'vectorStore', key: 'vectorStore' },
      { prefix: 'outputParser', key: 'outputParser' },
      { prefix: 'textSplitter', key: 'textSplitter' },
      { prefix: 'retriever', key: 'retriever' },
      { prefix: 'document', key: 'documentLoader' },
      { prefix: 'chain', key: 'chain' },
      { prefix: 'agent', key: 'agent' },
    ];
    for (var k = 0; k < langchainPrefixes.length; k++) {
      var p = langchainPrefixes[k];
      if (raw.indexOf(p.prefix) === 0 || lower.indexOf(p.prefix.toLowerCase()) === 0) {
        return p.key;
      }
    }

    return null;
  }

  // ---- Public API ----

  function getNodeIcon(nodeType) {
    if (!nodeType) return makeDefaultIcon('Unknown');
    var key = TYPE_MAP[nodeType];
    if (key) {
      var icon = resolveIcon(key);
      if (icon) return icon;
    }
    var guessed = guessKeyFromType(nodeType);
    if (guessed) {
      var icon2 = resolveIcon(guessed);
      if (icon2) return icon2;
    }
    var fallbackLabel = nodeType.split('.').pop() || 'Unknown';
    var readable = fallbackLabel.replace(/([A-Z])/g, ' $1').replace(/^./, function(s){ return s.toUpperCase(); }).trim();
    return makeDefaultIcon(readable);
  }

  function extractNodes(jsonData) {
    var workflow = jsonData;
    if (workflow && workflow.workflow && typeof workflow.workflow === 'object') {
      workflow = workflow.workflow;
    }
    if (!workflow || !Array.isArray(workflow.nodes)) return [];

    var seen = {};
    var result = [];
    for (var i = 0; i < workflow.nodes.length; i++) {
      var node = workflow.nodes[i];
      if (!node || !node.type) continue;
      if (node.type === 'n8n-nodes-base.stickyNote') continue;
      var type = node.type;
      if (seen[type]) continue;
      seen[type] = true;
      var icon = getNodeIcon(type);
      result.push({ type: type, label: icon.label, icon: icon });
    }
    return result;
  }

  function renderBadges(jsonData, options) {
    var opts = options || {};
    var max = opts.max || 6;
    var size = opts.size || 20;
    var nodes = extractNodes(jsonData);
    if (!nodes.length) return '';
    var visible = nodes.slice(0, max);
    var extra = nodes.length - max;
    var html = '<span class="n8n-wf-node-badges">';
    for (var i = 0; i < visible.length; i++) {
      var n = visible[i];
      html += '<span class="n8n-wf-node-badge" title="' + escapeAttr(n.label) + '" style="width:' + size + 'px;height:' + size + 'px">' + n.icon.svg + '</span>';
    }
    if (extra > 0) {
      html += '<span class="n8n-wf-node-badge n8n-wf-node-badge--more" title="' + extra + ' more nodes">+' + extra + '</span>';
    }
    html += '</span>';
    return html;
  }

  function escapeAttr(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return {
    getNodeIcon: getNodeIcon,
    extractNodes: extractNodes,
    renderBadges: renderBadges,
    VERSION: '2.0.0',
  };
});

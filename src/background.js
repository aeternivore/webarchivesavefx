browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'archive') {
    console.log(`Received archive request for URL: ${request.url}`);
    fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(request.url)}`)
      .then(response => response.json())
      .then(data => {
        if (data.archived_snapshots && data.archived_snapshots.closest) {
          const archiveUrl = data.archived_snapshots.closest.url;
          console.log(`Archived URL: ${archiveUrl}`);
          sendResponse({ success: true, url: archiveUrl });
        } else {
          console.error('No archived snapshot found');
          sendResponse({ success: false });
        }
      })
      .catch(err => {
        console.error('Error during archiving:', err);
        sendResponse({ success: false });
      });
    return true; // Keep the message channel open for async response
  }
});

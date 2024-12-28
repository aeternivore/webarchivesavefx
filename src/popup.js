// Tab switching logic
const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs and contents
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // Add active class to the clicked tab and its content
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');

    // Resize popup to match the default size of the Archive tab
    window.resizeTo(400, 600);
  });
});

// Set default popup window size
window.addEventListener('load', () => {
  window.resizeTo(600, 600); // Adjust the width and height as per the first window's size
});

// Load saved state and history from storage
window.addEventListener('DOMContentLoaded', async () => {
  const disableAutoOpen = await browser.storage.local.get('disableAutoOpen');
  const history = await browser.storage.local.get('history');

  document.getElementById('disableAutoOpen').checked = disableAutoOpen.disableAutoOpen || false;
  const historyList = history.history || [];
  const historyElement = document.getElementById('historyList');

  historyList.forEach(entry => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${entry}" target="_blank">${entry}</a>`;
    li.style.width = '200px';
    li.style.overflow = 'hidden';
    li.style.textOverflow = 'ellipsis';
    li.style.whiteSpace = 'nowrap';
    historyElement.appendChild(li);
  });

  // Add button to expand window and show full links
  const expandButton = document.createElement('button');
  expandButton.id = 'expandWindow';
  expandButton.textContent = 'Expand Window';
  expandButton.style.marginTop = '10px';
  expandButton.style.display = 'block';
  expandButton.style.cursor = 'pointer';
  historyElement.parentElement.appendChild(expandButton);

  expandButton.addEventListener('click', () => {
    const links = document.querySelectorAll('#historyList a');
    links.forEach(link => {
      link.style.whiteSpace = 'normal';
      link.style.overflow = 'visible';
      link.style.textOverflow = 'unset';
      link.style.width = 'auto';
    });

    // Resize the popup window to expand in width only
    window.resizeTo(800, 600); // Maintain the height but increase the width to 800px
  });
});

// Save state of the checkbox when toggled
document.getElementById('disableAutoOpen').addEventListener('change', async (e) => {
  await browser.storage.local.set({ disableAutoOpen: e.target.checked });
});

// Handle archive button click
document.getElementById('archiveButton').addEventListener('click', async () => {
  console.log('Archive button clicked');
  const url = document.getElementById('url').value;
  const disableAutoOpen = document.getElementById('disableAutoOpen').checked;

  if (!url) {
    console.error('No URL provided');
    document.getElementById('status').textContent = 'Please enter a valid URL.';
    return;
  }
  console.log(`URL to archive: ${url}`);

  try {
    const response = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.archived_snapshots && data.archived_snapshots.closest) {
      const archiveUrl = data.archived_snapshots.closest.url;
      const shortLink = archiveUrl.length > 30 ? archiveUrl.slice(0, 30) + '...' : archiveUrl;
      document.getElementById('status').innerHTML = `Archived: <a href="${archiveUrl}" target="_blank">[${shortLink}]</a>`;
      console.log(`Archived successfully: ${archiveUrl}`);

      if (!disableAutoOpen) {
        console.log('Opening archived link in new tab.');
        browser.tabs.create({ url: archiveUrl });
      }

      // Save to history
      const history = await browser.storage.local.get('history');
      const historyList = history.history || [];
      historyList.push(archiveUrl);
      await browser.storage.local.set({ history: historyList });

      // Update history UI
      const historyElement = document.getElementById('historyList');
      const li = document.createElement('li');
      li.innerHTML = `<a href="${archiveUrl}" target="_blank">${archiveUrl}</a>`;
      li.style.width = '200px';
      li.style.overflow = 'hidden';
      li.style.textOverflow = 'ellipsis';
      li.style.whiteSpace = 'nowrap';
      historyElement.appendChild(li);
    } else {
      console.error('Archiving failed for URL:', url);
      document.getElementById('status').textContent = 'Failed to archive the URL.';
    }
  } catch (error) {
    console.error('Error occurred:', error);
    document.getElementById('status').textContent = 'An error occurred while archiving.';
  }
});

// Handle current tab archive button click
document.getElementById('currentPageButton').addEventListener('click', async () => {
  console.log('Archive current page button clicked');

  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    console.error('No URL found for the current tab');
    document.getElementById('status').textContent = 'No valid URL found for the current tab.';
    return;
  }
  const url = tab.url;
  const disableAutoOpen = document.getElementById('disableAutoOpen').checked;

  try {
    const response = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.archived_snapshots && data.archived_snapshots.closest) {
      const archiveUrl = data.archived_snapshots.closest.url;
      const shortLink = archiveUrl.length > 30 ? archiveUrl.slice(0, 30) + '...' : archiveUrl;
      document.getElementById('status').innerHTML = `Archived: <a href="${archiveUrl}" target="_blank">[${shortLink}]</a>`;
      console.log(`Archived successfully: ${archiveUrl}`);

      if (!disableAutoOpen) {
        console.log('Opening archived link in new tab.');
        browser.tabs.create({ url: archiveUrl });
      }

      // Save to history
      const history = await browser.storage.local.get('history');
      const historyList = history.history || [];
      historyList.push(archiveUrl);
      await browser.storage.local.set({ history: historyList });

      // Update history UI
      const historyElement = document.getElementById('historyList');
      const li = document.createElement('li');
      li.innerHTML = `<a href="${archiveUrl}" target="_blank">${archiveUrl}</a>`;
      li.style.width = '200px';
      li.style.overflow = 'hidden';
      li.style.textOverflow = 'ellipsis';
      li.style.whiteSpace = 'nowrap';
      historyElement.appendChild(li);
    } else {
      console.error('Archiving failed for URL:', url);
      document.getElementById('status').textContent = 'Failed to archive the URL.';
    }
  } catch (error) {
    console.error('Error occurred:', error);
    document.getElementById('status').textContent = 'An error occurred while archiving.';
  }
});

// Handle clear history button click
document.getElementById('clearHistoryButton').addEventListener('click', async () => {
  console.log('Clear history button clicked');
  await browser.storage.local.set({ history: [] });

  const historyElement = document.getElementById('historyList');
  historyElement.innerHTML = '';
});

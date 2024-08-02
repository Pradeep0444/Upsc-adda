document.addEventListener('DOMContentLoaded', () => {
  const contentArea = document.querySelector(".content");
  const mainDiv = document.querySelector("main");
  const notesButton = document.getElementById('note-btn');
  const notesSection = document.querySelector(".notes-section");
  const cancelButton = document.querySelector(".fa-xmark");
  const notesTextarea = document.getElementById('notes');
  const saveNotesButton = document.getElementById('save-notes');
  const clearNotesButton = document.getElementById('clear-notes');
  const downloadNotesButton = document.getElementById('download-notes');

  // Load saved notes from local storage
  const savedNotes = localStorage.getItem('userNotes');
  if (savedNotes) {
      notesTextarea.value = savedNotes;
  }

  // Save notes to local storage
  saveNotesButton.addEventListener('click', () => {
      const notes = notesTextarea.value;
      localStorage.setItem('userNotes', notes);
      alert('Notes saved!');
  });

  // Clear notes
  clearNotesButton.addEventListener('click', () => {
      notesTextarea.value = '';
      localStorage.removeItem('userNotes');
      alert('Notes cleared!');
  });

  // Download notes as a text file
  downloadNotesButton.addEventListener('click', () => {
      const notes = notesTextarea.value;
      const blob = new Blob([notes], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'notes.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  });

  const openTextArea = () => {
    console.log("clicked")
    notesSection.style.display = 'flex';
    notesButton.style.display = 'none';
    contentArea.style.width = '65%'; 
    mainDiv.style.justifyContent = 'unset';
    mainDiv.style.alignItems = 'unset';
  }

  const closeTextArea = () => {
    notesSection.style.display = 'none';
    notesButton.style.display = 'block';
    contentArea.style.width = '90%';
    mainDiv.style.justifyContent = 'center';
    mainDiv.style.alignItems = 'center';
  }

  //contols
  notesButton.addEventListener('click', openTextArea);
  cancelButton.addEventListener('click', closeTextArea);
});
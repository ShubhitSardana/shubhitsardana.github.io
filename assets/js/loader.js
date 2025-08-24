document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.getElementById("main-content");

  const sections = [
    "./assets/sections/home.html",
    "./assets/sections/research-interests.html",
    "./assets/sections/publications.html",
    "./assets/sections/cv/cv.html",
    "./assets/sections/ongoing-projects.html",
    "./assets/sections/conference-presentations.html",
    "./assets/sections/blog.html",
    "./assets/sections/contact.html",
  ];

  const loadSections = async () => {
    for (const sectionFile of sections) {
      try {
        const response = await fetch(sectionFile);
        if (!response.ok) {
          throw new Error(
            `Could not load ${sectionFile}: ${response.statusText}`
          );
        }
        const content = await response.text();
        mainContent.innerHTML += content;
      } catch (error) {
        console.error("Error loading section:", error);
        mainContent.innerHTML += `<p style="color: red; text-align: center;">Failed to load section: ${sectionFile}. Please check console for details.</p>`;
      }
    }

    const customScript = document.createElement("script");
    customScript.src = "./assets/js/script.js";

    customScript.onload = () => {
      console.log(
        "All sections and scripts loaded. Initializing functionality."
      );
      initializeSlideshows();
      initializeVideoHovers();
    };

    document.body.appendChild(customScript);
  };

  loadSections();
});

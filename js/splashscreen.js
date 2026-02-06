window.addEventListener("load", () => {
  const splash = document.getElementById("splashScreen");
  const app = document.getElementById("app");

  setTimeout(() => {
    splash.style.display = "none";
    app.style.display = "block";
  }, 400); // 0.4 seconds
});

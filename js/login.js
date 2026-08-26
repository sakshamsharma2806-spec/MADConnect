import { findUserByEmail, getChapterById, setSession } from "./utils/authUtils.js";

const password = document.getElementById("password");
const toggle = document.getElementById("togglePassword");
const showPasswordCheckbox = document.getElementById("showPassword");
const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const button = document.getElementById("loginBtn");
const roleBtns = document.querySelectorAll(".role-btn");

let selectedRole = "cho";

roleBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    roleBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedRole = btn.dataset.role;
  });
});

toggle.addEventListener("click", () => {
  if (password.type === "password") {
    password.type = "text";
    toggle.innerHTML = "&#128064;";
    showPasswordCheckbox.checked = true;
  } else {
    password.type = "password";
    toggle.innerHTML = "&#128065;";
    showPasswordCheckbox.checked = false;
  }
});

showPasswordCheckbox.addEventListener("change", function () {
  if (this.checked) {
    password.type = "text";
    toggle.innerHTML = "&#128064;";
  } else {
    password.type = "password";
    toggle.innerHTML = "&#128065;";
  }
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const existingError = document.querySelector(".error");
  if (existingError) existingError.remove();

  if (email.value.trim() === "") {
    showError("Please enter your email.");
    return;
  }

  if (password.value.trim() === "") {
    showError("Please enter your password.");
    return;
  }

  button.classList.add("loading");
  button.innerHTML = "Logging in...";

  try {
    const user = await findUserByEmail(email.value.trim());

    if (!user) {
      showError("No account found with this email.");
      button.classList.remove("loading");
      button.innerHTML = "Login";
      return;
    }

    if (user.role !== selectedRole) {
      showError("This account is not registered as a " + (selectedRole === "admin" ? "Core Member" : "Chapter Organizer") + ".");
      button.classList.remove("loading");
      button.innerHTML = "Login";
      return;
    }

    let chapterName = "";
    if (user.chapterId) {
      const chapter = await getChapterById(user.chapterId);
      chapterName = chapter ? chapter.chapterName : "";
    }

    setSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      chapterId: user.chapterId || "",
      chapterName: chapterName,
    });

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 500);
  } catch (err) {
    console.error("Login error:", err);
    showError("Login failed. Please try again.");
    button.classList.remove("loading");
    button.innerHTML = "Login";
  }
});

function showError(message) {
  const div = document.createElement("div");
  div.className = "error";
  div.textContent = message;
  form.appendChild(div);
}

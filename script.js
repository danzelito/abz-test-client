const getToken = document.querySelector(".get-token");
const registerForm = document.querySelector(".user-register");
const users = document.querySelector(".get-all-users");
const divRenderUsers = document.querySelector(".render-all-users");
const nextBtn = document.querySelector(".next-users");
const previousBtn = document.querySelector(".previous-users");
const dataContainer = document.querySelector(".errors-container");
const tokenMessage = document.querySelector(".token-message");
const registerLink = document.querySelector(".register-link");
const allUsersLink = document.querySelector(".all-users-nav");
const oneUser = document.querySelector(".get-one-user");
const expiredTokenContainer = document.querySelector(
  ".expired-token-container"
);
const successGetTokenContainer = document.querySelector(
  ".success-token-container"
);
const message = document.querySelector(".initial-message");

let userData;
let currentPage = 1;
let userCounter = 0;
let limitOfUsersOnPage = 6;

const logoutHandler = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("expiryDate");
};

getToken.addEventListener("click", (e) => {
  e.preventDefault();
  fetch("https://abztest-task.herokuapp.com/api/v1/token", {
    method: "GET",
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (!data) {
        console.log("Something went Wrong. Try Again!");
      }
      localStorage.setItem("token", data.token);
      const expiryDate = new Date(new Date().getTime() + 40 * 60 * 1000);
      localStorage.setItem("expiryDate", expiryDate.toISOString());
      const html = `
                       <p class="alert alert-success text-center">Token has been received and set successfully. It is valid for 40 minutes and saved in localStorage.</br>
                       You can proceed to Registration Page. The link is now available in the Navigation Bar
                       </p>
                   `;
      if (tokenMessage) {
        tokenMessage.textContent = "";
        tokenMessage.insertAdjacentHTML("beforeend", html);
        registerLink.classList.remove("disabled");
      }
      if (successGetTokenContainer) {
        const html = `<p class="alert alert-success text-center">Token received. You can continue</p>`;
        successGetTokenContainer.insertAdjacentHTML("beforeend", html);
        setTimeout(() => {
          successGetTokenContainer.textContent = "";
        }, 5000);
      }
    });
});

if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");

    if (!token || !expiryDate) {
      const html = `<p class="alert alert-danger text-center">Token expired or invalid. Get the new one</a> and continue. Link is in the Navigation Bar`;
      expiredTokenContainer.insertAdjacentHTML("beforeend", html);
      return setTimeout(() => {
        expiredTokenContainer.textContent = "";
      }, 4000);
    }
    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      const html = `<p class="alert alert-danger text-center">Token expired. Get the new one and continue</p>`;
      expiredTokenContainer.insertAdjacentHTML("beforeend", html);
      return setTimeout(()=> {
        expiredTokenContainer.textContent = ""
      }, 5000)
    }
    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("phone", document.getElementById("phone").value);
    // formData.append("password", document.getElementById("password").value);
    formData.append(
      "position_id",
      document.getElementById("position_id").value
    );
    formData.append("photo", document.getElementById("photo").files[0]);
    fetch("https://abztest-task.herokuapp.com/api/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.success) {
          dataContainer.textContent = "";
          allUsersLink.classList.remove("disabled");
          oneUser.classList.remove("disabled");
          const html = `<h5>${data.message}</h5>
                        <h5>You will be redirected to Users Page</h5>`;
          dataContainer.insertAdjacentHTML("beforeend", html);
          return setTimeout(() => {
            location.replace("all-users.html");
          }, 5000);
        }
        if (data.message === "Validation failed") {
          dataContainer.textContent = "";
          const html = `<h5 class="alert alert-danger text-center">${data.message}</h5>`;
          dataContainer.insertAdjacentHTML("beforeend", html);
          Object.keys(data.fails).forEach((key) => {
            dataContainer.insertAdjacentHTML(
              "beforeend",
              `<h5>${data.fails[key]}</h5>`
            );
          });
        } else if (
          data.message.startsWith("jwt") ||
          data.message.startsWith("invalid")
        ) {
          const html = `<h5 class="alert alert-danger text-center">${data.message}</h5>`;
          dataContainer.textContent = "";
          dataContainer.insertAdjacentHTML("beforeend", html);
        } else {
          const html = `<h5 class="alert alert-danger text-center">${data.message}</h5>`;
          dataContainer.textContent = "";
          dataContainer.insertAdjacentHTML("beforeend", html);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

if (users) {
  users.addEventListener("click", (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");
    if (!token || !expiryDate) {
      const html = `<p class="alert alert-danger text-center">Token expired or invalid. Link is in the Navigation Bar. Use it and continue your navigation`;
      expiredTokenContainer.insertAdjacentHTML("beforeend", html);
      return setTimeout(() => {
        expiredTokenContainer.textContent = "";
      }, 4000);
    }
    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      const html = `<p class="alert alert-danger text-center">Token expired. Get the new one and continue</p>`;
      expiredTokenContainer.insertAdjacentHTML("beforeend", html);
      setTimeout(()=>{
        expiredTokenContainer.textContent = ""
      }, 5000)

      return setTimeout(() => {
        expiredTokenContainer.textContent = "";
      }, 5000);
    }
    divRenderUsers.textContent = "";
    fetch("https://abztest-task.herokuapp.com/api/v1/users/all-users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        return result.json();
      })
      .then((data) => {
        userData = data;
        console.log(userData);

        for (let i = 0; i < limitOfUsersOnPage; i += 1) {
          const html = `
        <div class="card m-3" style="max-width: 540px;">
          <div class="row g-0">
            <div class="col-md-4">
              <img style="width:70px" src="${
                userData.users[i].photo.startsWith("https://loremflickr.com")
                  ? userData.users[i].photo
                  : "http://localhost:8000/"
              }${
            userData.users[i].photo
          }" class="card-img img-fluid rounded-start" alt="...">
            </div>
            <div class="col-md-8">
              <div class="card-body">
              <h5 class="card-title">${userData.users[i].name}</h5>
                <h5 class="card-title">${userData.users[i]._id}</h5>
                <p class="card-text">${userData.users[i].phone}</p>
                <p class="card-text">${userData.users[i].email}</p>
                <p class="card-text"><small class="text-muted">Position ID: ${
                  userData.users[i].position_id
                }</small></p>
                <button class="btn bg-primary text-light next-6-users">User Details</button>
              </div>
            </div>
          </div>
        </div>`;
          divRenderUsers.insertAdjacentHTML("beforeend", html);
          userCounter = i;
        }
        if (currentPage === 1) {
          nextBtn.classList.remove("d-none");
          nextBtn.classList.add("d-inline");
        }
      });
  });
}

if (previousBtn) {
  previousBtn.addEventListener("click", (e) => {
    console.log(userData);
    e.preventDefault();
    divRenderUsers.textContent = "";
    let nextUsersToRender = userCounter - limitOfUsersOnPage;
    if (nextUsersToRender <= 0) {
      nextUsersToRender = -1;
    }
    for (let i = userCounter; i > nextUsersToRender; i -= 1) {
      console.log(userData.users[i]);
      console.log(i);
      console.log(userCounter);

      const html = `
    <div class="card m-3" style="max-width: 540px;">
      <div class="row g-0">
        <div class="col-md-4">
          <img style="width:70px" src="${
            userData.users[i].photo.startsWith("https://loremflickr.com")
              ? userData.users[i].photo
              : "http://localhost:8000/"
          }${
        userData.users[i].photo
      }" class="card-img img-fluid rounded-start" alt="...">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${userData.users[i]._id}</h5>
            <h5 class="card-title">${userData.users[i].name}</h5>
            <p class="card-text">${userData.users[i].phone}</p>
            <p class="card-text">${userData.users[i].email}</p>
            <p class="card-text"><small class="text-muted">Position ID: ${
              userData.users[i].position_id
            }</small></p>
            <button class="btn bg-primary text-light next-6-users">User Details</button>
          </div>
        </div>
      </div>
    </div>`;
      divRenderUsers.insertAdjacentHTML("beforeend", html);
      // if(userCounter < userData.users.length) {
      //   nextBtn.classList.remove('d-none')
      //   nextBtn.classList.add('d-inline')
      // }
      if (i === 0) {
        previousBtn.classList.remove("d-inline");
        previousBtn.classList.add("d-none");
        break;
      }
      userCounter = i - 1;
    }
    nextBtn.classList.remove("d-none");
    nextBtn.classList.add("d-inline");
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    previousBtn.classList.remove("d-none");
    previousBtn.classList.add("d-inline");
    divRenderUsers.textContent = "";
    let nextUsersToRender = userCounter + limitOfUsersOnPage;
    if (nextUsersToRender >= userData.length) {
      nextUsersToRender = userData.length;
    }
    for (let i = userCounter + 1; i < nextUsersToRender + 1; i += 1) {
      const html = `
    <div class="card m-3" style="max-width: 540px;">
      <div class="row g-0">
        <div class="col-md-4">
          <img style="width:70px" src="${
            userData.users[i].photo.startsWith("https://loremflickr.com")
              ? userData.users[i].photo
              : "http://localhost:8000/"
          }${
        userData.users[i].photo
      }" class="card-img img-fluid rounded-start" alt="...">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${userData.users[i]._id}</h5>
            <h5 class="card-title">${userData.users[i].name}</h5>
            <p class="card-text">${userData.users[i].phone}</p>
            <p class="card-text">${userData.users[i].email}</p>
            <p class="card-text"><small class="text-muted">Position ID: ${
              userData.users[i].position_id
            }</small></p>
            <button class="btn bg-primary text-light next-6-users">User Details</button>
          </div>
        </div>
      </div>
    </div>`;
      divRenderUsers.insertAdjacentHTML("beforeend", html);
      userCounter = i;
      if (i === userData.users.length - 1) {
        nextBtn.classList.remove("d-inline");
        nextBtn.classList.add("d-none");
        break;
      }
    }
    previousBtn.classList.remove("d-none");
    previousBtn.classList.add("d-inline");
  });
}

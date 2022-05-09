import cookie from "js-cookie";

//set in cookie
export const setCookie = (key, value) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("cookie set");
  }
  if (window !== undefined) {
    cookie.set(key, value, {
      expires: 1, // cookie expires in 1 day
    });
  }
};

export const removeCookie = (key) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("cookie removed");
  }
  if (window !== undefined) {
    cookie.remove(key, {
      expires: 1,
    });
  }
};

// get from cookie such as stored token will be used to make request to server with token
export const getCookie = (key) => {
  if (process.env.NODE_ENV !== "production") {
    // console.log("cookie get");
  }
  if (window !== undefined) {
    return cookie.get(key);
  }
};

// set in LocalStorage
export const setLocalStorage = (key, value) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("localStorage set");
  }
  if (window !== undefined) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

//remove from LocalStorage
export const removeLocalStorage = (key) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("localStorage removed");
  }
  if (window !== undefined) {
    localStorage.removeItem(key);
  }
};

// authenticate user by passing data to cookie and localStorage during signIn
export const authenticate = (response, next) => {
  // console.log("authenticate helper on SignIn response", response);
  setCookie("token", response.data.token);
  setLocalStorage("user", response.data.user);
  next();
};

//access user info from localStorage
export const isAuth = (key) => {
  if (process.env.NODE_ENV !== "production") {
    // console.log("localStorage get");
  }
  if (window !== undefined) {
    const cookieChecked = getCookie("token");
    if (cookieChecked) {
      if (localStorage.getItem("user")) {
        return JSON.parse(localStorage.getItem("user"));
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
};

export const signout = (next) => {
  removeCookie("token");
  removeLocalStorage("user");
  next();
};

export const updateUserInfo = (response, next) => {
  console.log("UPADATE USER IN LOCAL STORAGE HELPS", response);
  if (window !== undefined) {
    let auth = JSON.parse(localStorage.getItem("user"));
    auth = response.data;
    localStorage.setItem("user", JSON.stringify(auth));
  }
  next();
};

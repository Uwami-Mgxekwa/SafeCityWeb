export const storeDetailsToLocalstorage = (key, data) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  } else if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(data));
  }
};

export const getDetailsFromLocalstorage = (key) => {
  if (typeof localStorage !== "undefined") {
    let data = localStorage.getItem(key);
    return data;
  } else if (typeof sessionStorage !== "undefined") {
    let data = sessionStorage.getItem(key);
    return data;
  }
};

export const removeDetailsFromLocalstorage = (key) => {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(key);
  } else if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(key);
  }
};

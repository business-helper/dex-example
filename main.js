Moralis.initialize("7wLyHqUHZ9RnKvetgr5HhuhCihIJL0fCDHq0CvHC"); // application id from moralis.io
Moralis.serverURL = "https://hmjmvpi8bepg.usemoralis.com:2053/server"; // server url from moralis.io

async function login() {
  console.log("[Login]?");
  try {
    currentUser = Moralis.User.current();
    if (!currentUser) {
      currentUser = await Moralis.Web3.authenticate();
    }
  } catch (e) {
    console.log(error);
  }
}

$(function () {
  console.log("[OnLoading]");
  $("#login_button").on("click", login);
});
// document.getElementById('login_button').onclick = login;

Moralis.initialize("7wLyHqUHZ9RnKvetgr5HhuhCihIJL0fCDHq0CvHC"); // application id from moralis.io
Moralis.serverURL = "https://hmjmvpi8bepg.usemoralis.com:2053/server"; // server url from moralis.io

let currentTrade = {
  from: {},
  to: {},
};
let currentSelectSide = '';

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

async function init() {
  await Moralis.initPlugins();
  await Moralis.enable();
  // const tokens = await getSupportedTokens();
  // console.log('[Tokens]', tokens);
  listAvailableTokens();
}

async function getSupportedTokens() {
  const tokens = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
  });
  // console.log(tokens);
  return tokens;
}

async function listAvailableTokens() {
  const result = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: 'eth',
  });

  const tokens = result.tokens;
  let parent = document.getElementById('token-list');

  for (const address in tokens) {
    let token = tokens[address];
    let div = document.createElement('div');
    div.setAttribute('data-address', address);
    div.className = 'token-row';
    let html = `
      <img class="token-list-img" src="${token.logoURI}">
      <span class="token-list-text">${token.symbol}</span>
    `;

    div.innerHTML = html;
    parent.append(div)
  }
}

async function selectToken(event) {
  closeModal();
  let address = event.target.getAttribute('data-address');
  console.log('[address]', address);
  currentTrade
}

function openModal() {
  // document.getElementById('token-modal').
  $('#token-modal').modal('show');
}

function closeModal() {
  $('#token-modal').modal('hide');
}

$(function () {
  console.log("[OnLoading]");
  init();

  $("#login_button").on("click", login);
  $('#from-token-select').on('click', openModal);
});

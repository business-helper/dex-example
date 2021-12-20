Moralis.initialize("7wLyHqUHZ9RnKvetgr5HhuhCihIJL0fCDHq0CvHC"); // application id from moralis.io
Moralis.serverURL = "https://hmjmvpi8bepg.usemoralis.com:2053/server"; // server url from moralis.io

let currentTrade = {
  from: {},
  to: {},
};
let currentSelectSide = "";
let tokens;
const activeChain = "eth";

async function login() {
  try {
    currentUser = Moralis.User.current();
    if (!currentUser) {
      currentUser = await Moralis.Web3.authenticate();
    }
    console.log(currentUser.get("ethAddress"))
    renderLoginSection(true);
  } catch (e) {
    console.log(error);
  }
}

async function logout() {
  Moralis.User.logOut().then(() => {
    renderLoginSection(false);
  });
}

async function init() {
  await Moralis.initPlugins();
  await Moralis.enable();
  listAvailableTokens();
}

async function listAvailableTokens() {
  const result = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: "eth",
  });

  tokens = result.tokens;
  const addresses = Object.keys(tokens);
  currentTrade.from = tokens[addresses[0]];
  currentTrade.to = tokens[addresses[1]];
  renderInterface();

  let parent = document.getElementById("token-list");

  for (const address in tokens) {
    let token = tokens[address];
    let div = document.createElement("div");
    div.setAttribute("data-address", address);
    div.className = "token-row";
    let html = `
      <img class="token-list-img" src="${token.logoURI}">
      <span class="token-list-text">${token.symbol}</span>
    `;
    div.onclick = () => selectToken(address);
    div.innerHTML = html;
    parent.append(div);
  }
}

async function selectToken(address) {
  closeModal();
  currentTrade[currentSelectSide] = tokens[address];
  renderInterface();
  getQuote();
}

async function getQuote() {
  const fromInputValue = $("#from_amount").val();
  if (
    !currentTrade.from ||
    !currentTrade.to ||
    !fromInputValue ||
    currentTrade.from.address === currentTrade.to.address
  )
    return;
  const fromAmount = (Moralis.Units.ETH(fromInputValue));

  const quote = await Moralis.Plugins.oneInch.quote({
    chain: activeChain, // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentTrade.from.address, // The token you want to swap
    toTokenAddress: currentTrade.to.address, // The token you want to receive
    amount: fromAmount,
  });

  if (quote.error) {
    alert(quote.description);
    return;
  }
  $("#to_amount").val(quote.toTokenAmount / 10 ** quote.toToken.decimals);
  $("#gas-estimate").text(quote.estimatedGas);
}

async function trySwap() {
  let address = Moralis.User.current().get("ethAddress");
  const fromInputValue = $("#from_amount").val();
  const fromAmount = Moralis.Units.ETH(fromInputValue); //console.log()

  if (currentTrade.from.symbol !== "ETH") {
    // check allowance.
    // get allowance.
    const allowance = await Moralis.Plugins.oneInch.hasAllowance({
      chain: activeChain,
      fromTokenAddress: currentTrade.from.address,
      fromAddress: address,
      amount: fromAmount,
    });

    if (!allowance) {
      await Moralis.Plugins.oneInch.approve({
        chain: activeChain,
        tokenAddress: currentTrade.from.address,
        fromAddress: address,
      });
    }
  }

  const receipt = await Moralis.Plugins.oneInch.swap({
    chain: activeChain,
    fromTokenAddress: currentTrade.from.address,
    toTokenAddress: currentTrade.to.address,
    amount: fromAmount,
    fromAddress: address,
    slippage: 1,
  });

  // Trade
}

function renderInterface() {
  $("#from-token-image").attr("src", currentTrade["from"].logoURI);
  $("#from-token-symbol").text(currentTrade["from"].symbol);
  $("#to-token-image").attr("src", currentTrade["to"].logoURI);
  $("#to-token-symbol").text(currentTrade["to"].symbol);
}

function renderLoginSection(login) {
  $("#swap-button").attr("disabled", !login);
  $('#login_button').css('display', login ? 'none' : 'block');
  $('#logout_button').css('display', !login ? 'none' : 'block');
}

function openModal(side) {
  $("#token-modal").modal("show");
  currentSelectSide = side;
}

function closeModal() {
  $("#token-modal").modal("hide");
}

$(function () {
  renderLoginSection(false);

  init();

  $("#login_button").on("click", login);
  $('#logout_button').on('click', logout);
  $("#from-token-select").on("click", () => openModal("from"));
  $("#to-token-select").on("click", () => openModal("to"));

  $("#from_amount").on("blur", getQuote);
  $("#swap-button").on("click", trySwap);
});

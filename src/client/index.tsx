import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

import { AppContext, ContextState, ContextFunctions } from './contexts';
import AppView from './views/app';
import { CardType } from './types';

interface Props {
}

interface OwnState {
  alertInfo: {
    message?: string;
    action?: any;
    showing?: boolean;
    duration?: number;
  }
}

const theme = createMuiTheme({
});

class App extends React.Component<Props, ContextState & ContextFunctions & OwnState> {
  baseUrl = '';
  private contract: any;
  private qweb3: any;
  private refreshInterval;

  constructor(props: Props) {
    super(props);
    this.state = {
      alertInfo: {
        message: '',
        showing: false,
        action: undefined,
        duration: 0,
      },
      account: undefined,
      cards: undefined,
      selectedIndex: -1,
      getCards: this.getCards,
      selectCard: this.selectCard,
      sendPayment: this.sendPayment,
      requestCard: this.requestCard,
    };
    window.addEventListener("load", this.onWindowLoaded);
    if (typeof (document) !== 'undefined') {
      const protocol = (('https:' === document.location.protocol) ? 'https://' : 'http://');
      this.baseUrl = protocol + location.host;
    }
  }

  public get snackBar() {
    const { alertInfo } = this.state;
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={alertInfo.showing}
        autoHideDuration={alertInfo.duration}
        onClose={this.handleCloseAlert}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{alertInfo.message}</span>}
        action={alertInfo.action}
      />
    )
  }

  public render() {
    return (
      <AppContext.Provider value={this.state}>
        <MuiThemeProvider theme={theme}>
          <AppView />
          {this.snackBar}
        </MuiThemeProvider>
      </AppContext.Provider>
    );
  }

  public componentDidUpdate() {
    const { cards } = this.state;
    if (!cards || !cards.length) {
      return;
    }
    const pendingCards = cards.filter(card => card.pending);
    if (pendingCards && pendingCards.length) {
      this.refreshCard();
    } else if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  private refreshCard = () => {
    if (this.refreshInterval) {
      return;
    }
    this.refreshInterval = setInterval(() => this.getCards(), 5000);
  }

  private getCards = () => {
    fetch(`${this.baseUrl}/api/tokens/${this.state.account.address}`)
    .then(res => res.json())
    .then(result => {
      const { status, data } = result;
      if (status === 'success') {
        const { cards } = this.state;
        if (!cards || !data || data.length !== this.state.cards.length) {
          return this.setState({
            cards: data,
            selectedIndex: 0,
          });
        }
        const curPendingCards = cards.filter(card => card.pending);
        const nextPendingCards = data.filter(card => card.pending);
        if (curPendingCards.length != nextPendingCards.length) {
          this.setState({
            cards: data,
          });
        }
      }
    })
    .catch(err => {
      console.log(err);
    });
  }

  private requestCard = () => {
    const form = new FormData();
    form.append('address', this.state.account.address);
    fetch(`${this.baseUrl}/api/mint`, {
      method: 'POST',
      body: JSON.stringify({address: this.state.account.address}),
      headers: {
        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
        'Content-Type': 'application/json'
      },
    })
    .then(res => res.json())
    .then(res => {
      const { status, data } = res;
      if (status === 'success') {
        const { tx, db } = data;
        const { txid } = tx;
        const newCards = [...(this.state.cards || [] as any)];
        newCards.push(db);
        const alertAction = [(
          <Button color="secondary" size="small" onClick={() => {
            const url = `https://testnet.qtum.org/tx/${txid}`;
            const win = window.open(url, '_blank');
            win.focus();
          }} >
            Check Status
          </Button>
        )];
        this.setState({
          cards: newCards,
          alertInfo: {
            message: 'It will take some time to receive a new card. Please wait for a next block is mined.',
            showing: true,
            action: alertAction,
            duration: 3000,
          }
        });
      }
    })
    .catch(err => {
      console.log(err);
      this.setState({
        alertInfo: {
          message: err.message,
          showing: true,
          action: undefined,
          duration: 2000,
        }
      });
    })
  }

  private selectCard = (index) => this.setState({selectedIndex: index});

  private sendPayment = async (address: string) => {
    const { cards, selectedIndex, account } = this.state;
    const card = cards[selectedIndex];
    const tx = await this.contract.send("transfer", {
      methodArgs: [address, card.token_id],
      senderAddress: account.address,
    });
  }

  private onWindowLoaded = () => {
    if (!(window as any).qrypto) {
      return alert('Qrypto is not installed');
    }
    window.addEventListener("message", this.handleQryptoMessage, false);
    window.postMessage({ message: { type: "CONNECT_QRYPTO" }}, "*");

    const { Qweb3 } = require("qweb3");
    const { address, abi } = require("./contracts/qtum.json");
    this.qweb3 = new Qweb3((window as any).qrypto.rpcProvider);
    this.contract = this.qweb3.Contract(address, abi);
  }

  private handleQryptoMessage = (event) => {
    if (event.data.target !== "qrypto-inpage") {
      return;
    }
    if (event.data.message && event.data.message.type === "ACCOUNT_CHANGED") {
      const { error } = event.data.message.payload;
      if (error) {
        if (error === "Not logged in. Please log in to Qrypto first.") {
          // Show an alert dialog that the user needs to login first
          alert(error);
          this.setState({
            account: undefined,
            cards: undefined,
            selectedIndex: -1,
          });
        } else {
          // Handle different error than not logged in...
        }
        return
      } else {
        const account = (window as any).qrypto.account;
        if (!account || !account.address) {
          this.setState({
            account: undefined,
            cards: undefined,
            selectedIndex: -1,
          });
        } else if (!this.state.account || account.address !== this.state.account.address) {
          this.setState({account});
        }
      }
    }
  }

  private handleCloseAlert = () => this.setState((state) => {
    const newAlertState = {...state.alertInfo};
    newAlertState.showing = false;
    return {
      ...state,
      alertInfo: newAlertState,
    };
  });
}

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);

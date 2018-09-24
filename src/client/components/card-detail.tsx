import * as React from 'react';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import {
  CardType,
} from '../types';

interface Props {
  card: CardType;
  address: string;
  sendPayment(target: string);
}

interface State {
  dest: string;
}

export default class CardDetailView extends React.Component<Props, State> {
  public constructor(props) {
    super(props);
    this.state = {
      dest: ''
    };
  }

  public render() {
    const { card, address } = this.props;
    return (
      <div style={{ width: '100%' }}>
        <GridListTile style={{ padding: '10px', maxWidth: '300px', listStyle: 'none' }} >
          <img src={`/images/${card.img}`} alt={card.token_id.toString()} style={{ width: '100%' }} />
          <GridListTileBar
            title={card.token_id}
          />
        </GridListTile>
        <div>{`Your address: ${address}`}</div>
        {card.pending ? <div>It will take some time to receive the card. Please wait for a next block is mined</div> : <div>
          <TextField
            id="name"
            label="Send To"
            value={this.state.dest}
            onChange={this.onInputChange}
            margin="normal"
            fullWidth
          />
          <button style={{
            padding: 0,
            border: 'none',
            marginTop: '20px',
            cursor: 'pointer',
            outline: 'none',
          }}
            onClick={this.onSend}
          >
            <img src="/images/send.png" alt="" style={{
              height: '40px',
              width: 'auto',
            }} />
          </button>
        </div>}
      </div>
    );
  }

  private onInputChange = e => {
    this.setState({ dest: e.target.value });
  };
  private onSend = () => this.props.sendPayment(this.state.dest);
}

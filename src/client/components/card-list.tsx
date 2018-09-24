import * as React from 'react';

import { withStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/CheckRounded';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';

import {
  CardType,
  QryptoAccount,
} from '../types';

interface Props {
  account?: QryptoAccount;
  cards?: CardType[];
  selectedIndex: number;
  getCards: () => void;
  selectCard: (index) => void;
  requestCard: () => void;
}

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: 500,
    height: 450,
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
  button: {
    margin: theme.spacing.unit,
  },
});

const CardView = (props: { card: CardType, selected: boolean, onSelect }) => (
  <GridListTile style={{ width: '33.3%', padding: '10px', cursor: 'pointer', opacity: props.card.pending ? 0.4 : 1 }}
    cols={1} onClick={props.onSelect}
  >
    <img src={`/images/${props.card.img}`} alt={props.card.token_id.toString()} style={{ width: '100%' }} />
    <GridListTileBar
      title={props.card.token_id}
      actionIcon={!props.selected ? null :
        <IconButton>
          <InfoIcon color="action" />
        </IconButton>
      }
    />
  </GridListTile>
);

class CardListView extends React.Component<Props> {
  public componentDidMount() {
    const { account, getCards } = this.props;
    if (account && getCards) {
      getCards();
    }
  }
  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.account && nextProps.getCards && nextProps.account !== this.props.account) {
      nextProps.getCards();
    }
  }

  public render() {
    const { cards, selectCard, selectedIndex } = this.props;
    return (
      <div style={{ width: '100%' }}>
        {cards && cards.length ? (
          <GridList cellHeight={180} style={{ width: '100%', margin: 0 }} cols={3} spacing={20}>
            <GridListTile key="Subheader" style={{ height: 'auto' }} cols={3}>
              <ListSubheader component="div">{`Total cards: ${cards.length}`}</ListSubheader>
            </GridListTile>
            {cards.map((card, index) => (
              <CardView
                key={card.token_id}
                card={card}
                selected={index === selectedIndex}
                onSelect={() => this.props.selectCard(index)}
              />
            ))}
          </GridList>
        ) : <div>{'No cards found'}</div>}
        <button style={{
          padding: 0,
          border: 'none',
          marginTop: '20px',
          cursor: 'pointer',
          outline: 'none',
        }}
        onClick={this.props.requestCard}        
        >
          <img src="/images/get-one.png" alt="" style={{
            height: '40px',
            width: 'auto',
          }} />
        </button>
      </div>
    );
  }
}

export default CardListView;

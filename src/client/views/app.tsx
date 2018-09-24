import * as React from 'react';

import { AppContext } from '../contexts';

import CardListView from '../components/card-list';
import CardDetailView from '../components/card-detail';

export default class AppView extends React.Component<any, any> {
  public render() {
    return (
      <AppContext.Consumer>
        {(props) => (
          <div>
            <div className="logo">
              <img src="/images/logo.jpg" alt="" style={{
                width: '50%',
                height: 'auto',
              }} />
            </div>
            {props.account ? <div className="content" style={{ display: 'flex' }}>
              <div className="cardList" style={{ flex: 1, position: 'relative' }}>
                <CardListView {...props} />
              </div>
              <div className="cardDetail" style={{ flex: 1, position: 'relative'}}>
                <div style={{ marginLeft: '40px' }}>
                  {props.cards && props.cards.length ?
                    <CardDetailView card={props.cards[props.selectedIndex]} address={props.account.address} sendPayment={props.sendPayment} /> : null
                  }
                </div>
              </div>
            </div> : <div>Qrypto extension is not installed or not logged in</div>}
          </div>
        )}
      </AppContext.Consumer>
    );
  }
}

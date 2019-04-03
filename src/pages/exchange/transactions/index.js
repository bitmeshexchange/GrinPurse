import React, {Component} from 'react';
import { Tabs } from 'antd';
import { List, Typography, Collapse, Table } from 'antd';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import styles from './index.less';
import moment from 'moment';
import CustomClipboard from 'components/clipboard';
import { StickyContainer, Sticky } from 'react-sticky';
import { keepDecimal } from 'src/common/utils';

const BN = require('bignumber.js');
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
const scale = 1e9;

// list
const res = {"depth":{"bids":[[0.00063102,50,50],[0.00063101,115.999841,165.999841],[0.000631,300.893807,466.893648],[0.000625,20.328796,487.222444],[0.000624,28.975801,516.198245],[0.000623,29.022311,545.220556],[0.00062105,90,635.220556],[0.00062104,115,750.220556],[0.00062103,40,790.220556],[0.00062102,90,880.220556],[0.00062101,162.204328,1042.424884],[0.00061001,0.52458156,1042.94946556],[0.00061,600,1642.94946556],[0.00060201,81,1723.94946556],[0.0006,600,2323.94946556],[0.000599,191.668213,2515.61767856],[0.00059,700,3215.61767856],[0.000567,62.509871,3278.12754956],[0.00056,70,3348.12754956],[0.00054001,0.87035425,3348.99790381],[0.00054,60,3408.99790381],[0.0005122,30,3438.99790381],[0.0005112,0.14595,3439.14385381],[0.000502,71.239262,3510.38311581],[0.00050152,182.569683,3692.95279881],[0.0005,54.832919,3747.78571781],[0.00048061,79.529306,3827.31502381],[0.0004806,7,3834.31502381],[0.0004567,30,3864.31502381],[0.0004327,10,3874.31502381]],"asks":[[0.000641,17.797583,17.797583],[0.000644,7.344285,25.141868],[0.00064499,7.115859,32.257727],[0.00064999,100,132.257727],[0.00065,27.748861,160.006588],[0.00068943,0.90233477,160.90892277],[0.00068948,3.669754,164.57867677],[0.00068957,10.527614,175.10629077],[0.00068958,23.688987,198.79527777],[0.00068961,102.137389,300.93266677],[0.00068962,78.603673,379.53633977],[0.00068964,33.295866,412.83220577],[0.0006898,50,462.83220577],[0.00068989,80,542.83220577],[0.00069,51,593.83220577],[0.00069961,1.538921,595.37112677],[0.0006999,116.932168,712.30329477],[0.00069999,150,862.30329477],[0.0007,1,863.30329477],[0.000709,0.513496,863.81679077],[0.00071,0.1,863.91679077],[0.0007145,1.519213,865.43600377],[0.000719,150,1015.43600377],[0.00072,0.1,1015.53600377],[0.000725,23.093137,1038.62914077],[0.000729,4,1042.62914077],[0.00073,6.939941,1049.56908177],[0.000735,3,1052.56908177],[0.00074,0.1,1052.66908177],[0.00074352,3.840696,1056.50977777]]},"history":[[1553500376731,"1","0.000631","3.1"],[1553500374054,"1","0.000631","35.689521"],[1553499195167,"1","0.000631","7.11586"],[1553498779229,"1","0.000631","3.062923"],[1553498212698,"1","0.000631","6.125475"],[1553496073243,"1","0.000631","25.03662"],[1553495982965,"1","0.000631","4.873249"],[1553495756378,"1","0.000631","100"],[1553495720603,"1","0.000631","99.187086"],[1553495720603,"1","0.00063101","84.812914"],[1553495314408,"1","0.00063101","3.536167"],[1553495158588,"1","0.000633","1.96"],[1553493808259,"1","0.00063101","20.894178"],[1553493183801,"1","0.00063101","4.793341"],[1553492922869,"1","0.000631","14.915459"],[1553492476272,"1","0.00063102","70"],[1553491799621,"2","0.000632","0.4"],[1553491796990,"2","0.000632","2"],[1553491792765,"2","0.000632","10"],[1553491790686,"2","0.000632","10"],[1553491788590,"2","0.000632","10"],[1553491781495,"2","0.000632","10"],[1553491673387,"2","0.000632","4.29850746"],[1553491670728,"2","0.000632","5"],[1553491666251,"2","0.000632","5"],[1553491662120,"2","0.000632","5"],[1553491656523,"2","0.000632","5"],[1553491653452,"2","0.000632","5"],[1553491649980,"2","0.000632","1.78913286"],[1553491647794,"2","0.000632","2.64593581"],[1553491633784,"1","0.000645","6.233473"],[1553491601046,"1","0.000645","6.874457"],[1553491458825,"1","0.000645","19.985315"],[1553490932027,"1","0.000645","4.410252"],[1553489903103,"1","0.00064501","57.708858"],[1553489261134,"1","0.00064501","19.392777"],[1553488754079,"1","0.00064501","4.045913"],[1553487942604,"1","0.00064501","3.84"],[1553486731671,"1","0.00064501","100"],[1553484853187,"1","0.000645","5.113324"],[1553484224082,"1","0.000645","6.917402"],[1553481551322,"1","0.000645","1"],[1553481259521,"1","0.000645","1"],[1553478143293,"1","0.000675","0.91468556"],[1553478139948,"1","0.000675","55"],[1553477152937,"1","0.000675","37.955838"],[1553475991677,"1","0.000675","0.39282141"],[1553475989187,"1","0.000675","0.38857944"],[1553475986499,"1","0.000675","0.38766614"],[1553475982740,"1","0.000675","0.38621548"]],"statistics":{"stock":"GRIN","funds":"BTC","bid":[0.00063102,50],"ask":[0.000641,17.797583],"price":"0.000631","max":"0.0007","min":"0.00062101","volume":"4830.26823708","value":"3.11891834","change":"0.16"}}
let maxDepth = 0

// const api = {
//   depth: `https://api.bitmesh.com/?api=market.depth&params={%22market%22:%22btc_grin%22,%22limit%22:30,%22group%22:8}`,
//   history: `https://api.bitmesh.com/?api=market.tradeHistory&params={"market":"btc_grin"}`,
// } 
let roll
@connect(({ wallet}) => {
  return {
    ...wallet
  };
})
export default class Transactions extends Component {

  state = {
    asks: [],
    bids: [],
    history: [],
    maxDepth: 0,
  }
  renderTable() {

  }

  componentDidMount() {
    // this.fetchData();
  }

  // async fetchData() {

  //   let max = Math.max(res.depth.asks[res.depth.asks.length -1][2], res.depth.bids[res.depth.bids.length -1][2]);
  //   maxDepth = max;
  //   this.setState({
  //     asks: res.depth.asks,
  //     bids: res.depth.bids,
  //     history: res.history,
  //     maxDepth,
  //     statistics: res.statistics, 
  //   }); 
  // } 

  renderDepth() {
    if (!this.props.exchange.depth) {
      this.props.exchange.depth = {
        bids: [],
        asks: [],
      }
    }
    const { bids, asks } = this.props.exchange.depth;
    const maxDepth = Math.max(asks[asks.length -1] ? asks[asks.length -1][2] : 0, bids[bids.length -1] ? bids[bids.length -1][2] : 0);

    return <div className={styles.depth}>
      <div className={styles.title}>Order Book</div>
      <Row>
        <Col span={12}>

          <div className={styles.bids}>
            <div className={styles.header} gutter={2}>
               <Row style={{ lineHeight: '30px' }}>
                <Col span={9}>Total(GRIN)</Col>
                <Col span={7}>Amount</Col>
                <Col span={8} style={{textAlign: 'right', paddingRight: '5px'}}>Price(BTC)</Col>
              </Row>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div className={styles.asks}>
            <div className={styles.header} gutter={2}>
              <Row style={{ lineHeight: '30px' }}>
                <Col span={9} style={{paddingLeft: '5px'}}>Price(BTC)</Col>
                <Col span={7}>Amount</Col>
                <Col span={8} style={{textAlign: 'right', paddingRight: 5}}>Total(GRIN)</Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>

      <Row className={styles.depthBody}>
          <Col span={12}>
            <div className={styles.body}>
              {
                bids && bids.map(item => {
                  return <Row className={styles.row}>
                    <Col span={9}>{keepDecimal(item[2])}</Col>
                    <Col span={7}>{keepDecimal(item[1])}</Col>
                    <Col span={8} style={{textAlign: 'right', paddingRight: '5px', }}>
                      {item[0]}
                    </Col>
                    <div className={styles.bg} style={{width: `${item[2] * 100 /maxDepth}%`}}></div>
                  </Row>
                })
              }
            </div>
          </Col>

          <Col span={12}>
            <div className={styles.body}>
              {
                asks && asks.map(item => {
                  return <Row className={styles.row}> 
                    <Col span={9} style={{paddingLeft: '5px', }}>{item[0]}</Col>
                    <Col span={7}>{keepDecimal(item[1])}</Col>
                    <Col span={8} style={{textAlign: 'right', }}>
                      {keepDecimal(item[2])}
                    </Col>
                    <div className={styles.asksbg} style={{width: `${item[2] * 100 / maxDepth}%`}}></div>
                  </Row>
                })
              }
            </div>
          </Col>
        </Row>
    </div>
  }

  renderHistory() {
    const { history } = this.props.exchange;
    return <div className={styles.history}>
      <div className={styles.title}>Trade History</div>
      <div className={styles.header} gutter={2}>
          <Row style={{ lineHeight: '30px' }}>
            <Col span={11} >Price(BTC)</Col>
            <Col span={7}>Amount</Col>
            <Col span={6} style={{textAlign: 'right'}}>Date</Col>
          </Row>
        </div>
        <div className={styles.historyBody}>
          {
            history && history.map(item => {
              return <Row className={styles.row}>
                <Col span={11} className= {+item[1] === 1 ? styles.askHistory: styles.bidHistory }>{item[2]}</Col>
                <Col span={7}>{keepDecimal(item[3])}</Col>
                <Col span={6} style={{textAlign: 'right', }}>
                  {moment(item[0]).format('HH:mm')}
                </Col>
                {/* <div className={styles.asksbg}  style={{width: `${item[2] * 100 / maxDepth}%`}}></div>*/}
              </Row>
            })
          }
        </div>
      </div>
  }
  
  render() {
    const { statistics } = this.props.exchange;
    // if (!statistics) return <></>;

    return <div className={styles.container}>
      <Row gutter={10}>
        <Col span={16}>
          {this.renderDepth()}
        </Col>
        <Col span={8}>
          {this.renderHistory()}
        </Col>
      </Row>
    </div>
  }
}

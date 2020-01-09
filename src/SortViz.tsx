import React from 'react'

import Sorter, {ISorterEvent, ESortOpStages, ESortOps} from './Sorters/Sorter';
import SorterFactory, { Sorters } from './Sorters/SorterFactory'
import ArrayElement from './ArrayElement';

import Navbar from 'react-bootstrap/Navbar'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Container from 'react-bootstrap/Container'
import ReactSlider from 'react-slider'
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

interface IProps {}

interface IState {
  nElements: number;
  beingAccessed: Set<number>;
  beingCompared: Set<number>;
  beingSwapped: Set<number>;
  done: Set<number>;
  isSorting: boolean;
  sortAlgo: Sorters;
  sorterEvent: ISorterEvent;
}

class SortViz extends React.Component<IProps, IState> {
  sorter: Sorter;
  sorterFactory: SorterFactory;
  generator: Generator<ISorterEvent, void> | null;

  constructor(props: IProps) {
    super(props);

    this.state = {
      nElements: 50,
      beingAccessed: new Set<number>(),
      beingCompared: new Set<number>(),
      beingSwapped: new Set<number>(),
      done: new Set<number>(),
      isSorting: false,
      sortAlgo: Sorters.BASE,
      sorterEvent: {
        event_type: {
          stage: ESortOpStages.NONE,
          op: ESortOps.NONE,
        },
        elems: [],
      },
    };

    this.sorterFactory = new SorterFactory();
    this.sorter = this.sorterFactory.makeSorter();
    this.generator = null;

    this.handleButtonGenerate = this.handleButtonGenerate.bind(this);
    this.handleButtonSort = this.handleButtonSort.bind(this);
    this.handleDropdownSortAlgoSelect = this.handleDropdownSortAlgoSelect.bind(this);
    this.handleSliderNumElements = this.handleSliderNumElements.bind(this);
    this.handleSliderNumElementsRenderThumb = this.handleSliderNumElementsRenderThumb.bind(this);
  };

  componentDidMount() {
    this.generateRandomElements(this.state.nElements);
  };
  
  protected delayTime: number = 1;

  processEvent(e: (ISorterEvent | void)): boolean {
    if (!e) return false;
    let t = e.event_type;
    switch (t.op) {
      case ESortOps.ACCESS: {
        switch (t.stage) {
          case ESortOpStages.PRE: {
            this.setState((state) => {
              return {
                beingAccessed: new Set([...state.beingAccessed, ...(e.elems.map(element => element.index))]),
              };
            });
            setTimeout(() => this.run(), this.delayTime);
            return true;
          };
          case ESortOpStages.IN: {
            this.setState({
             sorterEvent: e, 
            });
            setTimeout(() => this.run(), this.delayTime);
            return true;
          };
          case ESortOpStages.POST: {
            this.setState((state) => {
              return {
                beingAccessed: new Set([...state.beingAccessed].filter(val => !e.elems.map(element => element.index).includes(val))),
              };
            });
            setTimeout(() => this.run(), this.delayTime);
            return true;
          };
          default: return false;
        };
      };
      case ESortOps.COMPARE: {
        switch (t.stage) {
          case ESortOpStages.PRE: {
            this.setState((state) => {
              return {
                beingCompared: new Set([...state.beingCompared, ...(e.elems.map(element => element.index))]),
              };
            });
            setTimeout(() => this.run(), this.delayTime);
            return true;
          };
          case ESortOpStages.IN: {
            this.setState({
              sorterEvent: e,
            });
            setTimeout(() => this.run(), this.delayTime);
            return true;
          };
          case ESortOpStages.POST: {
            this.setState(state => {
              return {
                beingCompared: new Set([...state.beingCompared].filter(val => !e.elems.map(element => element.index).includes(val))),
              };
            });
            setTimeout(() => this.run(), this.delayTime);
            return true;
          };
          default: return false;
        };
      };
      case ESortOps.SWAP: {
        switch (t.stage) {
          case ESortOpStages.PRE: {
            this.setState((state) => {
              return {
                beingSwapped: new Set([...state.beingCompared, ...(e.elems.map(element => element.index))]),
              };
            });
            setTimeout(() => this.run(), this.delayTime);
            return true;
          };
          case ESortOpStages.IN: {
            this.setState({
              sorterEvent: e,
            });
            setTimeout(() => this.run(), this.delayTime);
            return true;
          };
          case ESortOpStages.POST: {
            this.setState(state => {
              return {
                beingSwapped: new Set([...state.beingCompared].filter(val => !e.elems.map(element => element.index).includes(val))),
              };
            });
            setTimeout(() => this.run(), this.delayTime);
            return true;
          };
          default: return false;
        };
      };
      case ESortOps.DONE: {
        switch (t.stage) {
          case ESortOpStages.NONE: {
            this.setState((state) => {
              return {
                done: new Set([...state.done, ...(e.elems.map(element => element.index))]),
              };
            });
            return false;
          };
          default: return false;
        };
      };
      default: return false;
    };
  };

  run() {
    if (!this.generator) return;
    while (true) {
      let c = this.generator.next();
      if (c.done) {
        this.finalize();
        break;
      } else {
        if (this.processEvent(c.value)) break;
      };
    };
  };
  
  private finalize() {
    this.setState({
      isSorting: true,
    });
    setTimeout(() => this.reset(), 1000);
  };

  private reset() {
    this.setState({
      beingAccessed: new Set<number>(),
      beingCompared: new Set<number>(),
      beingSwapped: new Set<number>(),
      done: new Set<number>(),
      isSorting: false,
    });
  };

  private generateRandomElements(n: number, minVal: number = 1, maxVal: number = n): void {
    this.sorter.generate(n, minVal, maxVal);
    this.forceUpdate();
  }

  private handleSliderNumElements(n: number | number[] | null | undefined): void {
    if (n && typeof(n) === "number") {
      this.setState({
        nElements: n,
      });
    };
  };

  private handleButtonGenerate(): void {
    this.generateRandomElements(this.state.nElements);
  };

  private handleButtonSort(): void {
    if (this.state.sortAlgo === Sorters.BASE) return;
    this.setState({
      isSorting: true,
    });
    this.sorter = this.sorterFactory.makeSorter(this.state.sortAlgo).populate(this.sorter.get_data());
    this.generator = this.sorter.sort();
    this.delayTime = 10.0/this.sorter.n_elements();
    this.run();
  };

  private handleDropdownSortAlgoSelect(eventKey: string): void {
    switch (eventKey) {
      case Sorters.BUBBLE_SORTER.toString():
        this.setState({sortAlgo: Sorters.BUBBLE_SORTER});
        break;
      case Sorters.INSERTION_SORTER.toString():
        this.setState({sortAlgo: Sorters.INSERTION_SORTER});
        break;
      case Sorters.MERGE_SORTER.toString():
        this.setState({sortAlgo: Sorters.MERGE_SORTER});
        break;
      default:
        break;
    };
  };

  private handleSliderNumElementsRenderThumb(props: object, state: {index: number, value: number | number[], valueNow: number}): JSX.Element {
    return (
      <div {...props}>
        {state.valueNow}
      </div>
    );
  };

  render() {
    let data = this.sorter.get_data();
    let max_val = Math.max(...data);

    return (
      <Container className="sort-viz" fluid={true}>
        <Container className="control-area" id="control-area" fluid={true}>
          <Row>
            <Col>
              <Navbar.Text>Sorting Algorithm</Navbar.Text>
            </Col>
            <Col>
              <Navbar.Text>Number of elements</Navbar.Text>
            </Col>
            <Col>
              <Navbar.Text>Control buttons</Navbar.Text>
            </Col>
          </Row>
          <Row>
            <Col>
              <DropdownButton id="dropdown-sort-algo" title={this.sorterFactory.getSorterName(this.state.sortAlgo).algo} disabled={this.state.isSorting}>
                <Dropdown.Item key={Sorters.BUBBLE_SORTER} eventKey={Sorters.BUBBLE_SORTER.toString()} id="dropdown-item-bubblesort" onSelect={this.handleDropdownSortAlgoSelect}>Bubble Sort</Dropdown.Item>
                <Dropdown.Item key={Sorters.INSERTION_SORTER} eventKey={Sorters.INSERTION_SORTER.toString()} id="dropdown-item-insertionsort" onSelect={this.handleDropdownSortAlgoSelect}>Insertion Sort</Dropdown.Item>
                <Dropdown.Item key={Sorters.MERGE_SORTER} eventKey={Sorters.MERGE_SORTER.toString()} id="dropdown-item-mergesort" onSelect={this.handleDropdownSortAlgoSelect}>Merge Sort</Dropdown.Item>
              </DropdownButton>
            </Col>
            <Col>
              <ReactSlider
                className="slider-num-elements"
                thumbClassName="slider-num-elements-thumb"
                trackClassName="slider-num-elements-track"
                value={this.state.nElements}
                min={1}
                max={128}
                onAfterChange={this.handleSliderNumElements}
                renderThumb={this.handleSliderNumElementsRenderThumb}
                disabled={this.state.isSorting}
              />
            </Col>
            <Col>
              <Button className="mr-1" onClick={this.handleButtonGenerate} disabled={this.state.isSorting}>Generate</Button>
              <Button className="ml-1" onClick={this.handleButtonSort} disabled={this.state.isSorting}>Sort!</Button>
            </Col>
          </Row>
        </Container>
        <Container className="visualization-area" id="visualization-area" fluid={true}> {
          data.map((val, idx) => (
            <ArrayElement
              key={idx}
              width={`${100 / this.state.nElements}%`}
              height={`${(val * 100 / max_val).toFixed()}%`}
              beingAccessed={this.state.beingAccessed.has(idx)}
              beingCompared={this.state.beingCompared.has(idx)}
              beingSwapped={this.state.beingSwapped.has(idx)}
              done={this.state.done.has(idx)}
            />
          ), this)
        } </Container>
      </Container>
    );
  }
};

export default SortViz;
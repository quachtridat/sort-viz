import React from 'react';

import Sorter, {ISorterEvent, ESortOpStages, ESortOps} from '../lib/Sorters/Sorter';
import SorterFactory, { Sorters } from '../lib/Sorters/SorterFactory';
import ArrayElement from './ArrayElement';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Container from 'react-bootstrap/Container';
import ReactSlider from 'react-slider';
import Button from 'react-bootstrap/Button';

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
      nElements: (1 << 6),
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
  }

  componentDidMount() {
    this.generateRandomElements(this.state.nElements);
  }
  
  protected delayTime: number = 1;

  processEvent(e: (ISorterEvent | void)): boolean {
    if (!e) return false;
    let t = e.event_type;
    switch (t.op) {
      case ESortOps.ACCESS:
      case ESortOps.COMPARE:
      case ESortOps.SWAP: {
        let currentSet = this.state.beingAccessed;
        switch (t.op) {
          case ESortOps.ACCESS: currentSet = this.state.beingAccessed; break;
          case ESortOps.COMPARE: currentSet = this.state.beingCompared; break;
          case ESortOps.SWAP: currentSet = this.state.beingSwapped; break;
        }
        switch (t.stage) {
          case ESortOpStages.PRE: {
            e.elems.forEach(elem => currentSet.add(elem.index));
            setTimeout(() => this.run(), this.delayTime);
            return true;
          }
          case ESortOpStages.IN: {
            this.setState({
             sorterEvent: e,
            });
            setTimeout(() => this.run(), this.delayTime);
            return true;
          }
          case ESortOpStages.POST: {
            e.elems.forEach(elem => currentSet.delete(elem.index));
            setTimeout(() => this.run(), this.delayTime);
            return true;
          }
          default: return false;
        }
      }
      case ESortOps.DONE: {
        if (t.stage === ESortOpStages.NONE) {
            e.elems.forEach(elem => this.state.done.add(elem.index));
            setTimeout(() => this.run(), this.delayTime);
            return true;
          } else return false;
      }
      default: return false;
    }
  }

  run() {
    if (!this.generator) return;
    while (true) {
      let c = this.generator.next();
      if (c.done) {
        this.finalize();
        break;
      } else {
        if (this.processEvent(c.value)) break;
      }
    }
  }
  
  private finalize() {
    this.setState({
      isSorting: true,
    });
    setTimeout(() => this.reset(), 1000);
  }

  private reset() {
    this.setState({
      beingAccessed: new Set<number>(),
      beingCompared: new Set<number>(),
      beingSwapped: new Set<number>(),
      done: new Set<number>(),
      isSorting: false,
    });
  }

  private generateRandomElements(n: number, minVal: number = 1, maxVal: number = n): void {
    this.sorter.generate(n, minVal, maxVal);
    this.forceUpdate();
  }

  private handleSliderNumElements(n: number | number[] | null | undefined): void {
    if (n && typeof(n) === 'number') {
      this.setState({
        nElements: n,
      });
    }
  }

  private handleButtonGenerate(): void {
    this.generateRandomElements(this.state.nElements);
  }

  private handleButtonSort(): void {
    if (this.state.sortAlgo === Sorters.BASE) return;
    this.setState({
      isSorting: true,
    });
    this.sorter = this.sorterFactory.makeSorter(this.state.sortAlgo).populate(this.sorter.get_data());
    this.generator = this.sorter.sort();
    this.delayTime = 10.0/this.sorter.n_elements();
    this.run();
  }

  private handleDropdownSortAlgoSelect(eventKey: string | null): void {
    if (eventKey)
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
      }
  }

  private handleSliderNumElementsRenderThumb(props: object, state: {index: number, value: number | number[], valueNow: number}): JSX.Element {
    return (
      <div {...props}>
        {state.valueNow}
      </div>
    );
  }

  render() {
    let data = this.sorter.get_data();
    let max_val = Math.max(...data);

    return (
      <Container id='sort-viz' className='sort-viz' fluid={true}>
        <Container id='control-area' className='control-area' fluid={true}>
          <Container className='flex-column'>
            <p>Sorting Algorithm</p>
            <DropdownButton
              id='dropdown-sort-algo' title={this.sorterFactory.getSorterName(this.state.sortAlgo).algo} variant={this.state.sortAlgo === Sorters.BASE ? 'danger' : 'info'} disabled={this.state.isSorting}>
                {
                  ([
                    {
                      sorter: Sorters.BUBBLE_SORTER,
                      htmlId: 'dropdown-item-bubblesort',
                      content: 'Bubble Sort'
                    },
                    {
                      sorter: Sorters.INSERTION_SORTER,
                      htmlId: 'dropdown-item-insertionsort',
                      content: 'Insertion Sort'
                    },
                    {
                      sorter: Sorters.MERGE_SORTER,
                      htmlId: 'dropdown-item-mergesort',
                      content: 'Merge Sort'
                    },
                  ] as Array<{sorter: Sorters, htmlId: string, content: React.ReactNode}>).map(
                    (item) => (
                      <Dropdown.Item key={item.sorter} eventKey={item.sorter.toString()} id={item.htmlId} onSelect={this.handleDropdownSortAlgoSelect} children={item.content} />
                    )
                  )
                }
            </DropdownButton>
          </Container>
          <Container className='flex-column'>
            <p>Number of elements</p>
            <ReactSlider
              className='slider-num-elements'
              thumbClassName='slider-num-elements-thumb'
              trackClassName='slider-num-elements-track'
              value={this.state.nElements}
              min={1}
              max={128}
              onAfterChange={this.handleSliderNumElements}
              renderThumb={this.handleSliderNumElementsRenderThumb}
              disabled={this.state.isSorting}
            />
          </Container>
          <Container className='flex-column'>
            <p>Operation</p>
            <Container className='d-flex justify-content-around'>
              <Button onClick={this.handleButtonGenerate} disabled={this.state.isSorting || this.state.nElements < 2}>Generate</Button>
              <Button onClick={this.handleButtonSort} variant='success' disabled={this.state.isSorting || this.state.sortAlgo === Sorters.BASE || this.state.nElements < 2}>Sort</Button>
            </Container>
          </Container>
        </Container>
        <Container id='visualization-area' className='visualization-area' fluid={true}> {
          data.map((val, idx) => (
            <ArrayElement
              key={idx}
              width={`${100 / data.length}%`}
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
}

export default SortViz;
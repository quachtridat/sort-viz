import React from 'react';

interface IProps {
  width: string;
  height: string;
  beingAccessed: boolean;
  beingCompared: boolean;
  beingSwapped: boolean;
  done: boolean;
}

interface IState {}

export default class ArrayElement extends React.Component<IProps, IState> {
  private static _htmlClasses: string[] = ['array-element'];

  static defaultProps = {
    width: 0,
    height: 0,
  };

  constructor(props: IProps) {
    super(props);
  }
  
  render() {
    let classes = ArrayElement._htmlClasses.slice();
    if (this.props.beingAccessed) classes.push('being-accessed');
    if (this.props.beingCompared) classes.push('being-compared');
    if (this.props.beingSwapped) classes.push('being-swapped');
    if (this.props.done) classes.push('done');
    return (
      <span className={classes.join(' ')} style={{width: this.props.width, height: this.props.height,}}>
      </span>
    );
  }
}
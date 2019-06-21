export function Queue() {
  let _front = 0;
  let _end = 0;
  let _list = {};

  this.push = function(item) {
    _list[_end++] = (item) ;
  };

  this.pop = function() {
    if (this.getLength() === 0) {
      return undefined;
    }

    const item = _list[_front];
    delete _list[_front];
    _front++;
    return item;
  };

  this.peek = function() {
    return _list[_front];
  };

  this.getLength = function() {
    return _end - _front;
  };

  this.isEmpty = function() {
    return this.getLength() === 0;
  }
}

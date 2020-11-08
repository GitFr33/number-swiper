class NumberSwiper{

  constructor(element_id, value){

    var NS = this;
    NS.el = document.getElementById(element_id);
    NS.columns = Array.prototype.slice.call(NS.el.querySelectorAll('.number-swiper-column'));

    NS.scroll_settings = {'behavior':'smooth','block':'center'};
    NS.ignore_scroll = {1:0,2:0,3:0};
    NS.value_input = NS.el.querySelector('.number-swiper-value');

    var centerNineEl = NS.el.querySelector('#center-nine-1');
    NS.rootMargin = Math.round((NS.columns[0].offsetHeight - centerNineEl.offsetHeight) / 2);

    NS.centerNinePosition = centerNineEl.offsetTop - NS.rootMargin;
    NS.centerZeroPosition = NS.centerNinePosition + centerNineEl.offsetHeight;

    // manually center all the columns

    // NS.el.querySelectorAll('.number-swiper-active-number').forEach(function(node){
    //   node.scrollIntoView({'block':'center'});
    // });

    console.log('number Swiper RootMargin', NS.rootMargin);

    var observer = new IntersectionObserver(function(numbers) {

      numbers.forEach(function(number){
        var column_el = number.target.parentElement;
        var column = parseInt(column_el.dataset.column);

        if(number.isIntersecting === true &&  NS.ignore_scroll[column] != 1){

          var value = parseInt(number.target.innerText);
          var old_value = column_el.dataset.value;
          var next_column = column + 1;

          if(value == 0 && old_value == 9){
            console.log('got to the bottom of column ',column);
            NS.setColumnValue(next_column,'up'); // incriment next column up
          }else if(value == 9 && old_value == 0){
            console.log('got to the top of column ',column);
            NS.setColumnValue(next_column,'down');
          }

          if(number.target.classList.contains('number-swiper-end')){
            NS.ignore_scroll[column] = 1;
            console.log('Reached the end of column '+column+', re-centering');


            if(number.target.classList.contains('nine')){
              var position = NS.centerNinePosition;
              var element_to_scroll_to = column_el.querySelector('#center-nine-'+column);
            }else{
              var position = NS.centerZeroPosition;
              var element_to_scroll_to = column_el.querySelector('#center-zero-'+column);
            }

            setTimeout(function(){
              // wait till it stops, then recenter
              console.log('scroll',column_el,'to position',position);

              column_el.scroll(0,position);
              NS.activateNumber(element_to_scroll_to);
            },500);

            setTimeout(function(){
              NS.ignore_scroll[column] = 0;

              console.log('done re-centering');

            },550);

          }else{
            NS.activateNumber(number.target);
          }
        }
      });

    }, {
      root: NS.el,
      rootMargin: '-'+NS.rootMargin+'px 0px',
      threshold: .6
    });

    // if there was a value passd in to the constructor set that now
    if(value){
      NS.value = value;
    }

    var numbers = document.querySelectorAll(".number-swiper-column li");
    numbers = Array.prototype.slice.call(numbers);

    // observe scoll intersection of each number
    numbers.forEach(function(number) {
      observer.observe(number);
    });

    return this;
  }

  activateNumber(number_el){

    var NS = this;

    var value = number_el.innerText;

    // move active-number class to this number
    number_el.parentElement.querySelector('.number-swiper-active-number').classList.remove('number-swiper-active-number');

    number_el.classList.add('number-swiper-active-number');

    // set new column value
    number_el.parentElement.dataset.value = value;

    // set the new total value
    var total = '';
    NS.columns.forEach(function(column){
      total = total + column.dataset.value;
    });

    NS.value_input.value = total;
    NS.el.dataset.value = total;

    if ("createEvent" in document) {
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("change", false, true);
      NS.value_input.dispatchEvent(evt);
    }else{
      NS.value_input.fireEvent("onchange");
    }
  }

  getNumber(column, value){
    var NS = this;
    // value can be keyword 'active' to select the active number
    // returns the element

    if(value == 'active' || isNaN(value) ){
      return NS.el.querySelector('.number-swiper-column-'+column+' .number-swiper-active-number');
    }

    // TODO: get the index of the active number, start at that index, if the new value is less the the old, iterate in reverse

    var numbers = NS.el.querySelector('.number-swiper-column-'+column).getElementsByTagName("li");

    for (var i = 8; i < numbers.length + 8; i++) {
      if (numbers[i].textContent == value) {
        return numbers[i];
      }
    }
  }

  setColumnValue(column, value){
    var NS = this;

    console.log('setColumnValue set column '+column+' to', value);

    var el = NS.el.querySelector('.number-swiper-column-'+column);

    if(el){
      if(parseInt(el.dataset.value) == parseInt(value)){
        console.log('column',column, 'is already at',value);
        return;
      }

      NS.ignore_scroll[column] = 1;

      var current_value = el.dataset.value;
      var new_value;
      var new_element;

      if(typeof(value) == 'number' ){
        new_value = parseInt(value);
        if(new_value > 9){ new_value = 0;}
        if(new_value < 0){ new_value = 9;}

        new_element = NS.getNumber(column, new_value);
      }else{
        if(value == 'up'){
          new_element = NS.getNumber(column, 'active').nextElementSibling;
        }else if(value == 'down'){
          new_element = NS.getNumber(column, 'active').previousElementSibling;
        }
      }
      if(new_element){
        console.log('set column '+column+' to ', value);
        // scrollIntoView is super buggy in chrome / android webview so use jquery for now.

        var position = new_element.offsetTop - NS.rootMargin;

        el.scroll({top: position, left: 0, behavior: 'smooth'});

        setTimeout(function(){
          console.log('done animating column',column);
          NS.ignore_scroll[column] = 0;

        },500);
        NS.activateNumber(new_element);

      }else{
        console.log('ack, no new_element found ', value, 'in', column);
        NS.ignore_scroll[column] = 0;
      }
    }else{
      console.log('no column '+ column);
    }
  }

  set value(value){

    var NS = this;

    var digits = value.toString().split('').reverse();
    digits = digits.map(Number);
    console.log('setting value to', value);

    for (var i = 0; i < NS.columns.length; i ++){
      var column = i + 1;
      var number = digits[i] ?? 0;

      NS.setColumnValue(column,number);

    }
  }

  get value(){

    return parseInt(this.el.dataset.value);
  }
}

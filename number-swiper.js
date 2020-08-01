class NumberSwiper{

  constructor(element_id, value){
    var NS = this;
    NS.el = document.getElementById(element_id);

    var observer = new IntersectionObserver(function(numbers) {

      numbers.forEach(function(number){

        if(number.isIntersecting === true){

          var value = parseInt(number.target.innerText);
          var old_value = number.target.parentElement.dataset.value;
          var column = parseInt(number.target.parentElement.dataset.column);
          var next_column = column + 1;

          // move active-number class to this number
          number.target.parentElement.querySelector('.number-swiper-active-number').classList.remove('number-swiper-active-number');
          number.target.classList.add('number-swiper-active-number');

          if(number.target.classList.contains('last-zero')){
            console.log('we reached the end re-center the column');
            NS.el.querySelector('#center-'+column).scrollIntoView();
          }

          if(value == 0 && old_value == 9){
            console.log('got to the bottom of column ',column);
            NS.setColumnValue(next_column,'up'); // incriment next column up
          }else if(value == 9 && old_value == 0){
            console.log('got to the top of column ',column);
            NS.setColumnValue(next_column,'down');
          }

          // set new column value
          number.target.parentElement.dataset.value = value;

          // set the new total value
          var columns = NS.el.querySelectorAll('.number-swiper-column');
          var total = '';
          columns = Array.prototype.slice.call(columns);
          columns.forEach(function(column){
            total = total + column.dataset.value;
          });

          var value_input = NS.el.querySelector('.number-swiper-value');
          value_input.value = total;
          NS.el.dataset.value = total;

          if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            value_input.dispatchEvent(evt);
          }else{
            value_input.fireEvent("onchange");
          }
        }
      });

    }, {
      root: NS.el,
      rootMargin: '0px',
      threshold: 1
    });

    var numbers = document.querySelectorAll(".number-swiper-column li");
    numbers = Array.prototype.slice.call(numbers);

    // observe scoll intersection of each number
    numbers.forEach(function(number) {
      observer.observe(number);
    });

    return this;
  }

  getNumber(column, value){
    var NS = this;
    // value can be keyword 'active' to select the active number
    // returns the element

    if(value == 'active'){
      return NS.el.querySelector('.number-swiper-column-'+column+' .number-swiper-active-number');
    }

    var numbers = NS.el.querySelector('.number-swiper-column-'+column).getElementsByTagName("li");

    for (var i = 0; i < numbers.length; i++) {
      if (numbers[i].textContent == value) {
        return numbers[i];
      }
    }
  }

  setColumnValue(column, value){
    var NS = this;
    var el = NS.el.querySelector('.number-swiper-column-'+column);

    if(el){
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
        new_element.scrollIntoView({behavior: "smooth", block: "center"});
      }
    }else{
      console.log('no column '+ column);
    }
  }

  set value(value){

    var NS = this;
    //TODO: validate / truncate value length, throws error

    var digits = value.toString().split('').reverse();
    digits = digits.map(Number);

    var columns = NS.el.querySelectorAll('.number-swiper-column');
    columns = Array.prototype.slice.call(columns);

    for (var i = 0; i < columns.length; i ++){
      var column = i + 1;
      var number = digits[i] ?? 0;
      console.log('set column',column,'to',number);
      NS.getNumber(column, number).scrollIntoView({behavior: "smooth", block: "center"});

    }
    // var column = 1;
    //
    // digits.forEach(function(value){
    //   NS.getNumber(column, value).scrollIntoView({behavior: "smooth", block: "center"});
    //   column ++;
    // })
  }

  get value(){

    return parseInt(this.el.dataset.value);
  }
}

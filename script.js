var clickOnDays = [];
var events = [];

function Event(date, event) {
    this.date = date;
    this.event = event;
}

// Връща име на месец със зададен индекс. С възможност за връщане само на 1-вите 3 букви от името
function getMonthName(month, short = false) {
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'];
    return (short === false) ? monthNames[month] : monthNames[month].substring(0, 3);
}

function getTitle(month, year) {
    return getMonthName(month) + ' ' + year;
}

// Изписването на select-а за избор на месец
function printSelectMonth(month) {
    var text = '<select class="form-control input-sm select-month" name="select-month" id="select-month">';
    for (let i = 0; i < 12; i++) {
        text += '<option value="' + i + '"' + (month === i ? ' selected' : '') + '>' + getMonthName(i) + '</option>';
    }
    text += '</select>';
    return text;
}

// Изписването на select-а за избор на година. Годината, която е активна в календара е в средата
// на списъка, като под и над нея има по 5 години. При смяна на годината, това се актуализира
function printSelectYear(year) {
    var text = '';
    for (let i = year - 5; i < year + 6; i++) {
        text += '<option value="' + i + '"' + (year === i ? ' selected' : '') + '>' + i + '</option>';
    }
    return text;
}

// Смяна на изгледа от седмичен към месечен и обратно. Скриване на бутоните за следваща и предишна
// седмица, ако бъде избран изглед по месеци
Calendar.prototype.printWeekMonthView = function () {
    if (this.weekMonthView === 'week') {
        query('#week-month-view').innerHTML(
            '<i class="fa fa-chevron-circle-left fa-lg pull-left" id="previous-week" aria-hidden="true"></i>' +
            '<span id="week-month-view-change">' + (this.weekMonthView === 'month' ? 'week' : 'month') + ' view</span>' +
            '<i class="fa fa-chevron-circle-right fa-lg pull-right" id="next-week" aria-hidden="true"></i>'
        );
        var week = query('.week');
        for (let i = 1; i < week.nodes.length; i++) {
            query('.week').css('display', 'none', i);
        }
    } else {
        query('#week-month-view').innerHTML('<span id="week-month-view-change">' + (this.weekMonthView === 'month' ? 'week' : 'month') + ' view</span>');
        var week = query('.week');
        for (let i = 0; i < week.nodes.length; i++) {
            query('.week').css('display', '', i);
        }
    }

    var _calendar = this;
    query('#week-month-view-change').on('click', function () {
        _calendar.weekMonthView = _calendar.weekMonthView === 'month' ? 'week' : 'month';
        _calendar.printWeekMonthView();

    });
    var week = query('.week');
    if (_calendar.weekMonthView === 'week') {
        for (let i = 1; i < week.nodes.length; i++) {
            query('.week').css('display', 'none', i);
        }
        query('#next-week').on('click', function () {
            _calendar.week++;
            _calendar.showNextWeek();
        })
        query('#previous-week').on('click', function () {
            _calendar.showPreviousWeek();
        })
    }
};

// Инициализирането на календара/дейтпикъра. Създаване на събития за работата му.
// Ако е закачен към Input елемент, променям стиловете на обекта като размер, сянката
// около него и при влизане в конкретния Input, визуализирам дейтпикъра точно под него.
// При загуба на фокуса от Input-а скривам дейтпикъра
function Calendar(element) {
    var root = query(element);
    if (root.nodes[0].nodeName === 'INPUT') {
        this.view = 'date-picker';
    } else {
        this.view = 'calendar';
        this.weekMonthView = 'month';
    }
    this.root = element;
    this.year = new Date().getFullYear();
    this.week = 0;
    this.month = new Date().getMonth();
    table = '            <div id="holder" class="row">\n' +
        '<div id="datetime-holder" class="row">\n' +
        '<div class="header col-md-12" id="c-weeks-0">\n' +
        '<div class="my-row month col-md-4" id="left-div">\n' +
        '<i class="fa fa-chevron-circle-left fa-lg" id="previous-month" aria-hidden="true"></i><span class="month-title" id="month-title">' + getMonthName(this.month, true) + '</span>' +
        '<i class="fa fa-chevron-circle-right fa-lg" id="next-month" aria-hidden="true"></i>' +
        printSelectMonth(this.month) +
        '</div>\n' +
        '<div class="center col-md-4 month-year-title" id="middle-div">' + getTitle(this.month, this.year) +
        '<div id="week-month-view"></div>' +
        '</div>\n' +
        '<div class="my-row year col-md-4 pull-right" id="right-div">\n' +
        '<i class="fa fa-chevron-circle-left fa-lg" id="previous-year" aria-hidden="true"></i><span class="year-title" id="year-title">' + this.year + '</span>\n' +
        '<i class="fa fa-chevron-circle-right fa-lg" id="next-year" aria-hidden="true"></i><br>' +
        '<select class="form-control input-sm select-year pull-right" name="select-year" id="select-year">' +
        printSelectYear(this.year) +
        '</select>' +
        '</div>\n' +
        '</div>\n' +
        '<table class="calendar-table table table-condensed table-tight">\n' +
        '            <thead>\n' +
        '            <tr class="c-weeks">\n' +
        '                <th class="c-name" id="c-weeks-1">Mon</th>\n' +
        '                <th class="c-name" id="c-weeks-2">Tue</th>\n' +
        '                <th class="c-name" id="c-weeks-3">Wed</th>\n' +
        '                <th class="c-name" id="c-weeks-4">Thu</th>\n' +
        '                <th class="c-name" id="c-weeks-5">Fri</th>\n' +
        '                <th class="c-name" id="c-weeks-6">Sat</th>\n' +
        '                <th class="c-name" id="c-weeks-7">Sun</th>\n' +
        '            </tr>\n' +
        '            </thead>\n';

    table += this.daysForMonth(this.year, this.month);

    var _calendar = this;

    if (this.view === 'date-picker') {
        query('body').insertAdjacentHTML('beforeend', table);
        query('#holder')
            .css('width', '370px')
            .css('position', 'absolute')
            .css('left', (root.nodes[0].offsetLeft) + 'px')
            .css('top', (root.nodes[0].offsetTop + root.nodes[0].offsetHeight) + 'px')
            .css('-webkit-box-shadow', '0px 20px 57px -5px rgba(0,0,0,0.75)')
            .css('-moz-box-shadow:', '0px 20px 57px -5px rgba(0,0,0,0.75)')
            .css('box-shadow', '0px 20px 57px -5px rgba(0,0,0,0.75)')
            .css('border', '1px solid #DFDFDF');
        query('.table').css('width', '85%');
        query('#holder').css('display', 'none');
        root.on('focus', function () {
            query('#holder').css('display', 'block');
            document.getElementById("holder").focus();
            _calendar.isShowed = true;
        });

        document.onclick = function (e) {
            var _convertedName;
            if (element[0] === '#' || element[0] === '.') {
                _convertedName = element.substring(1, element.length);
            } else {
                _convertedName = element;
            }
            if (e.target.id !== 'holder' && e.target.id !== _convertedName &&
                e.target.id !== 'next-month' && e.target.id !== 'previous-month' &&
                e.target.id !== 'select-year' && e.target.id !== 'select-month' &&
                e.target.id !== 'next-year' && e.target.id !== 'previous-year' &&
                e.target.id !== 'datetime-holder' && e.target.id !== 'left-div' &&
                e.target.id !== 'month-title' && e.target.id !== 'year-title' &&
                !(e.target.id >= 'c-weeks-0' && e.target.id <= 'c-weeks-7') &&
                e.target.id !== 'middle-div' && e.target.id !== 'right-div'
            ) {
                query('#holder').css('display', 'none');
            }
        };

        for (let i = 0; i < query('.calendar-day').nodes.length; i++) {
            query('.calendar-day').css('height', '25px', i);
        }
    } else {
        root.insertAdjacentHTML('beforeend', table);
        _calendar.printWeekMonthView();
    }
    this.setClickOnDays();

    query('#previous-month').on('click', function () {
        _calendar.showPreviousMonth();
    });

    query('#next-month').on('click', function () {
        _calendar.showNextMonth();
    });

    query('#previous-year').on('click', function () {
        _calendar.showPreviousYear();
    });

    query('#next-year').on('click', function () {
        _calendar.showNextYear();
    });

    query('~select-month').on('change', function () {
        var selectMonth = query('~select-month');
        _calendar.changeMonth(selectMonth.nodes[0].options[selectMonth.nodes[0].selectedIndex].value);
    });

    query('~select-year').on('change', function () {
        var selectYear = query('~select-year');
        _calendar.changeYear(selectYear.nodes[0].options[selectYear.nodes[0].selectedIndex].value);
    });

}


// Опресняване на информацията на календара/дейтпикъра при смяна на седмица, месец или година
Calendar.prototype.changeDate = function () {
    query('.month-year-title').innerHTML(getTitle(this.month, this.year) + '<div id="week-month-view"></div>');
    query('.month-title').innerHTML(getMonthName(this.month, true));
    query('~select-month').setValue(this.month);
    query('~select-year').innerHTML(printSelectYear(this.year));
    query('.year-title').innerHTML(this.year);
    query('.days').innerHTML(this.daysForMonth(this.year, this.month));
    if (this.view === 'date-picker') {
        for (let i = 0; i < query('.calendar-day').nodes.length; i++) {
            query('.calendar-day').css('height', '25px', i);
        }
    }
    this.setClickOnDays();
    if (this.view === 'calendar') {
        this.printWeekMonthView();
    }
}

function showEventsForDate(date) {
    var text = '';
    var count=1;
    for (let i = 0; i < events.length; i++) {
        if (equalDates(new Date(date.split('.')[2], date.split('.')[1]-1, date.split('.')[0]), events[i].date)) {
            if(text===''){
                text+='Events for date ' + date + ' are:\n';
            }
            text += (count++) + '. ' + events[i].title;
        }
    }
    return text === '' ? 'There are no events for this date!' : text;
}

// Създаване на събития за кликане върху датите. Ако е дейтпикър и се кликне върху определена дата
// тя се добавя като текст в Input елемента. Ако е календар, при кликане върху дата се показва
// прозорец който пита какво събитие да се добави за съответната дата
Calendar.prototype.setClickOnDays = function () {
    clickOnDays = [];
    for (let i = 0; i < this.numDaysInCalendar; i++) {
        var _calendar = this;
        if (this.view === 'calendar') {
            clickOnDays.push(query('#day-' + i).on('click', function (e) {
                var date = query('#hidden-date-' + (i + 1)).getAttribute('value');
                var date = new Date(date.split('.')[2], date.split('.')[1] - 1, date.split('.')[0]);
                var input = prompt('Enter event for ' + query('#hidden-date-' + (i + 1)).getAttribute('value'));
                if (input === null || input === '') {
                    return;
                }

                events.push({
                    'date': date,
                    'title': input
                });
                query('#have-event-' + i).insertAdjacentHTML('beforeend', '<div class="event all-day begin end" title="' + input + '">' + input + '</div>');
            }));
            clickOnDays.push(query('#day-' + i).on('contextmenu', function (e) {
                e.preventDefault();
                var date = query('#hidden-date-' + (i + 1)).getAttribute('value');
                alert(showEventsForDate(date));
            }));
        } else {
            clickOnDays.push(query('#day-' + i).on('click', function (e) {
                query('#holder').css('display', 'none');
                query(_calendar.root).setAttr('value', query('#hidden-date-' + (i + 1)).getAttribute('value'));
            }));
        }
    }
}

// Смяна на месеца и опресняване на информацията на календара/дейтпикъра
Calendar.prototype.changeMonth = function (month) {
    if (month >= 0 && month <= 11) {
        this.month = parseInt(month);
        this.changeDate();
    }
}

// Смяна на годината по зададена такава и опресняване на информацията на календара/дейтпикъра
Calendar.prototype.changeYear = function (year) {
    this.year = parseInt(year);
    this.changeDate();
}

// Смяна на месеца със следващия и опресняване на информацията на календара/дейтпикъра
Calendar.prototype.showNextMonth = function () {
    if (this.month === 11) {
        this.month = 0;
        this.year++;
    } else {
        this.month++;
    }
    this.changeDate();
}

// Смяна на мецеца с предишния такъв и опресняване на информацията на календара/дейтпикъра
Calendar.prototype.showPreviousMonth = function () {
    if (this.month === 0) {
        this.month = 11;
        this.year--;
    } else {
        this.month--;
    }
    this.changeDate();
}

// Смяна на седмицата със следващата такава и опресняване на информацията на календара/дейтпикъра
Calendar.prototype.showNextWeek = function () {
    var _calendar = this;
    var week = query('.week');
    if (_calendar.week === query('.week').nodes.length) {
        _calendar.showNextMonth();
        var monthBeginFromMonday = new Date(_calendar.year, _calendar.month, 0).getDay() === 0;
        _calendar.week = monthBeginFromMonday ? 0 : 1;
        query('.week').css('display', '', _calendar.week);
        for (let i = 0; i < week.nodes.length; i++) {
            if (i !== _calendar.week) {
                query('.week').css('display', 'none', i);
            }
        }
    } else {
        for (let i = 0; i < week.nodes.length; i++) {
            query('.week').css('display', (i === _calendar.week ? '' : 'none'), i);
        }
    }
}


function daysInMonth(year, month) {
    var now = new Date(year, month);
    return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

// Смяна на седмицата с предишната такава и опресняване на информацията на календара/дейтпикъра
Calendar.prototype.showPreviousWeek = function () {
    var _calendar = this;
    var week = query('.week');
    if (this.week > 0) {
        this.week--;
    } else {
        this.showPreviousMonth();
        var monthEndOnSunday = daysInMonth(_calendar.year, _calendar.month).getDay() === 0;
        _calendar.week = monthEndOnSunday ? week.nodes.length - 1 : week.nodes.length - 2;
    }

    if (_calendar.week >= query('.week').nodes.length) {
        query('.week').css('display', '', _calendar.week);
        for (let i = 0; i < week.nodes.length; i++) {
            if (i !== _calendar.week) {
                query('.week').css('display', 'none', i);
            }
        }
    } else {
        for (let i = 0; i < week.nodes.length; i++) {
            query('.week').css('display', (i === _calendar.week ? '' : 'none'), i);
        }
    }
}

// Смяна на годината със следващата такава и опресняване на информацията на календара/дейтпикъра
Calendar.prototype.showNextYear = function () {
    this.changeYear(++this.year);
}

// Смяна на годината с предишната такава и опресняване на информацията на календара/дейтпикъра
Calendar.prototype.showPreviousYear = function () {
    this.changeYear(--this.year);
}

// Проверка дали конкретна дата е равна на днешната
function isCurrentDate(year, month, date) {
    var today = new Date();
    return (today.getFullYear() === new Date(year, month).getFullYear() &&
        (today.getMonth() === new Date(year, month).getMonth() &&
            (today.getDate() === new Date(year, month, date).getDate()))) === true;
}

// Сравняване на 2 дати дали са равни
function equalDates(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
}

// Използвам го за добавяне на водеща нула към дните и месеците по-малки от 9,
// за да се получи дата във формата 14.02.2019, вместо 14.2.2019
function pad(number) {
    return number > 9 ? number : '0' + number;
}

// Показване на събитията за конкретна дата в календара
function printEventsForDate(date) {
    var text = '';
    for (let i = 0; i < events.length; i++) {
        if (equalDates(date, events[i].date) === true) {
            text += '<div class="event all-day begin end" title="' + events[i].title + '">' + events[i].title + '</div>';
        }
    }
    return text;
}

// Визуализиране на календара/дейтпикъра
Calendar.prototype.daysForMonth = function (year, month) {
    var data = new Date(year, month, 0);
    var text = '';
    var _year = month > 0 ? year : year - 1;
    var _month = month > 0 ? month - 1 : 11;
    var previousMonth = new Date(_year, _month + 1, 0).getDate() - data.getDay();
    var count = 1;
    var col = 0;
    var dayNum = 0;
    var weekNum = 0;

    text += '<tbody class="days">';
    for (let i = 0; i < new Date(year, month, 0).getDay(); i++) {
        if (i === 0) {
            text += '<tr class="week">';
        }
        text += '                <td class="calendar-day outside" id="day-' + dayNum++ + '">\n' +
            '<input id="hidden-date-' + dayNum + '" type="hidden" value="' + pad(previousMonth + i + 1) + '.' + pad(_month + 1) + '.' + _year + '">' +
            '                    <span class="date">' + (previousMonth + i + 1) + '</span>\n' +
            '<div id="have-event-' + (dayNum - 1) + '">';
        text += printEventsForDate(new Date(_year, _month, previousMonth+ i + 1)) +
            '</div></td>\n';
        col++;
    }

    var mustStay = true;
    while (mustStay) {
        if (col % 7 === 0) {
            text += '<tr class="week">';
        }
        text += '                <td class="calendar-day ' + (isCurrentDate(year, month, count) ? ' current-day' : '') + '" id="day-' + dayNum++ + '">\n' +
            '<input id="hidden-date-' + dayNum + '" type="hidden" value="' + pad(count) + '.' + pad(month + 1) + '.' + year + '">' +
            '                    <span class="date">' + (count++) + '</span>\n' +
            '<div id="have-event-' + (dayNum - 1) + '">' +
            printEventsForDate(new Date(year, month, count - 1)) +
            '</div></td>\n';
        col++;
        mustStay = !((count - 1 == new Date(year, month + 1, 0).getDate()));
        if (col % 7 === 0) {
            col = 0;
            text += '</tr>';
        }
    }

    var count = 0;
    var nextMonth;
    var nextYear;
    if (month < 11) {
        nextMonth = month + 2;
        nextYear = year;
    } else {
        nextMonth = 1;
        nextYear = year + 1;
    }
    if (col % 7 !== 0) {
        for (let i = col % 7; i < 7; i++) {
            count++;
            text += '                <td class="calendar-day outside" id="day-' + dayNum++ + '">\n' +
                '<input id="hidden-date-' + dayNum + '" type="hidden" value="' + pad(count) + '.' + pad(nextMonth) + '.' + nextYear + '">' +
                '                    <div class="date">' + (count) + '</div>\n' +
                '<div id="have-event-' + (dayNum - 1) + '">' +
                printEventsForDate(new Date(nextYear, nextMonth - 1, count)) +
                '</div>' +
                '</td>\n';
        }
    }
    text += '</tr></tbody></table></div>';
    this.numDaysInCalendar = dayNum;
    return text;
}

// Method chaining за работа с DOM
function query(selector) {
    if (!(this instanceof query)) {
        return new query(selector);
    }
    this.nodes = [];
    if (typeof selector === "string" && selector !== '') {
        var nodes;
        if (selector[0] === '~') {
            nodes = document.getElementsByName(selector.substring(1, selector.length));
        } else {
            nodes = document.querySelectorAll(selector);
        }
        for (var i = 0; i < nodes.length; i++) {
            this.nodes[i] = nodes[i];
        }
    }
}

// Промяна на стойност на елемент
query.prototype.setValue = function (value, index = 0) {
    this.nodes[index].value = value;
    return this;
};

// Връща родителя на даден елемент
query.prototype.parent = function (index = 0) {
    return this.nodes[index].parentNode;
};

// Връща децата на даден елемент
query.prototype.child = function (index = 0) {
    return this.nodes[index].childNodes;
};

// Връща цвета
query.prototype.color = function (setColor, index = 0) {
    this.nodes[index].style.color = setColor;
    return this;
};

// Промяна на стиловете
query.prototype.css = function (attr, value, index = 0) {
    this.nodes[index].style[attr] = value;
    return this;
};

// Промяна на стиловете
query.prototype.style = function (attr, index = 0) {
    return this.nodes[index].style[attr];
};

// Връща следващ елемент
query.prototype.nextSibling = function (index = 0) {
    return this.nodes[index].nextSibling;
}

// Връща предишен елемент
query.prototype.previousSibling = function (index = 0) {
    return this.nodes[index].previousSibling;
}

// Премахва елемент
query.prototype.removeElement = function (index = 0) {
    this.nodes[index].remove();
    return this;
};

// Добавя html на определена позиция в DOM елемента
query.prototype.insertAdjacentHTML = function (position, str, index = 0) {
    this.nodes[index].insertAdjacentHTML(position, str);
    return this;
};

// Създаване на дете към елемент
query.prototype.addChild = function (element, index = 0) {
    this.nodes[index].insertAdjacentHTML('beforeend', element.nodes);
    return this;
};

// Замяна на html на DOM елемент
query.prototype.innerHTML = function (element, index = 0) {
    this.nodes[index].innerHTML = element !== undefined ? element : '';
    return this;
};

// Създаване на елемент
query.prototype.addDOMObject = function (element, index = 0) {
    if (typeof element === 'object') {
        this.nodes[index].appendChild(element.nodes);
    } else {
        var newElement = document.createElement(element);
        this.nodes[index].appendChild(newElement);
    }
    return this;
};

// Добавяне на клас/класове към DOM елемент
query.prototype.addClass = function (className) {
    className = className.replace('  ', ' ');
    var classes = className.split(' ');
    for (let j = 0; j < this.nodes.length; j++) {
        for (let i = 0; i < classes.length; i++) {
            this.nodes[j].classList.add(classes[i]);
        }
    }
    return this;
}

// Премахване на клас към елемент
query.prototype.removeClass = function (className, index = 0) {
    this.nodes[index].classList.remove(className);
    return this;
}

// Създаване на елемент
query.prototype.createElement = function (element, index = 0) {
    return document.createElement(element);
}

// Установяване на атрибути
query.prototype.setAttr = function (tag, value, index = 0) {
    this.nodes[index].setAttribute(tag, value);
    return this;
}

// Промяна на текстовото съдържание
query.prototype.textContent = function (value, index = 0) {
    if (value !== undefined) {
        this.nodes[index].textContent = value;
    }
    return this;
}

// Връща текстовото съдържание на елемент
query.prototype.getTextContent = function (value, index = 0) {
    return this.nodes[index].textContent;
}
// Връща атрибут на елемент
query.prototype.getAttribute = function (attr, index = 0) {
    return this.nodes[index].getAttribute(attr);
}

// Работа със събития
query.prototype.on = function (type, event, index = 0) {
    this.nodes[index].addEventListener(type, event);
    return this;
}

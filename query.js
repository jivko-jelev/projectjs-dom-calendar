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

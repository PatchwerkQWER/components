COMPONENT('dashboard', 'delay:700;axisX:12;axisY:144;padding:10;animation:3;serviceinterval:5000;minsizexs:3;minsizesm:2;minsizemd:2;minsizelg:1;iconremove:fa fa-trash-o;iconsettings:fa fa-cog', function(self, config, cls) {

	var cls2 = '.' + cls;
	var cache = {};
	var data = [];
	var services = [];
	var events = {};
	var skip = false;
	var drag = {};
	var movable = {};
	var serviceid;
	var pixel;
	var $D = $(document);
	var $W = $(W);
	var current_display;
	var isinit = true;

	self.readonly();

	self.make = function() {

		self.aclass(cls);
		self.on('resize + resize2', events.resize);
		$W.on('resize', events.resize);

		$D.on('mousedown touchstart', cls2 + '-title,' + cls2 + '-resize-button', events.ondown);
		$D.on('dragstart', '[draggable]', drag.handler);
		$D.on('touchstart', '[draggable]', drag.handler);

		self.event('mousedown touchstart', cls2 + '-control', function(e) {

			e.preventDefault();
			e.stopPropagation();

			var el = $(this);
			var name = el.attrd('name');
			var id = el.closest(cls2 + '-item').attrd('id');
			var tmp = cache[id];
			if (name === 'settings')
				tmp.meta.settings && tmp.meta.settings.call(tmp, tmp.config, tmp.element, el);
			else if (name === 'remove')
				self.wdestroy(id, true);

		});

		self.event('dragenter dragover dragexit drop dragleave', function(e) {
			switch (e.type) {
				case 'drop':
					drag.drop(e);
					break;
			}
			e.preventDefault();
		});

		current_display = WIDTH(self.element);
		serviceid = setInterval(events.service, config.serviceinterval);
	};

	drag.touchmove = function(e) {
		var evt = e.touches[0];
		drag.lastX = evt.pageX;
		drag.lastY = evt.pageY;
	};

	drag.touchend = function(e) {

		e.target = document.elementFromPoint(drag.lastX, drag.lastY);
		drag.unbind();

		if (e.target !== self.dom) {
			var parent = e.target.parentNode;
			var is = false;
			while (true) {

				if (parent === self.dom) {
					is = true;
					e.target = parent;
					break;
				}

				parent = parent.parentNode;
				if (!parent || parent.tagName === 'BODY' || parent.tagName === 'HTML')
					break;
			}
			if (!is)
				return;
		}

		if (e.target) {
			var pos = self.op.position();
			e.pageX = drag.lastX;
			e.pageY = drag.lastY;
			e.offsetX = e.pageX - pos.left;
			e.offsetY = e.pageY - pos.top;
			self.change(true);
			drag.drop(e);
		}
	};

	drag.bind = function() {
		$D.on('touchmove', drag.touchmove);
		$D.on('touchend', drag.touchend);
	};

	drag.unbind = function() {
		$D.off('touchmove', drag.touchmove);
		$D.off('touchend', drag.touchend);
	};

	drag.handler = function(e) {

		if (HIDDEN(self.element))
			return;

		drag.el = $(e.target);
		e.touches && drag.bind();
		var dt = e.originalEvent.dataTransfer;
		dt && dt.setData('text', '1');
	};

	drag.drop = function(e) {
		var meta = {};
		meta.pageX = e.pageX;
		meta.pageY = e.pageY;
		meta.offsetX = e.offsetX;
		meta.offsetY = e.offsetY;
		meta.el = drag.el;
		meta.target = $(e.target);
		meta.x = (meta.offsetX / pixel) >> 0;
		meta.y = (meta.offsetY / pixel) >> 0;
		meta.d = current_display;
		config.ondrop && self.EXEC(config.ondrop, meta, self);
		self.change(true);
	};

	events.service = function() {
		for (var i = 0; i < services.length; i++) {
			var tmp = services[i];
			if (tmp.$service)
				tmp.$service++;
			else
				tmp.$service = 1;
			tmp.meta.service && tmp.meta.service.call(tmp, tmp.$service, tmp.element);
		}
	};

	events.resize = function() {
		self.resize2();
	};

	events.bind = function(is) {

		if (events.is === is)
			return;

		if (is)
			$(W).on('mouseup touchend', events.onup).on('mousemove touchmove', events.onmove);
		else
			$(W).off('mouseup touchend', events.onup).off('mousemove touchmove', events.onmove);

		events.is = is;
	};

	events.ondown = function(e) {

		var el = $(this);
		self.aclass(cls + '-mousedown');
		$(document.body).aclass(cls + '-noscroll');

		movable.type = el.hclass(cls + '-title') ? 1 : 2;
		el = el.closest(cls2 + '-item');
		movable.id = el.attrd('id');

		click.call(this, e);

		var tmp = cache[movable.id];

		if (movable.type === 2) {
			if (!tmp.meta.actions.resize)
				return;
		} else {
			if (!tmp.meta.actions.move)
				return;
		}

		movable.istouch = e.type === 'touchstart';

		e.stopPropagation();
		e.preventDefault();

		if (movable.istouch)
			e = e.touches[0];

		movable.is = true;
		movable.el = el;
		movable.ticks = Date.now();
		movable.pageX = e.pageX;
		movable.pageY = e.pageY;
		movable.changed = false;
		movable.x = movable.type === 1 ? tmp.offset.x : tmp.offset.width;
		movable.y = movable.type === 1 ? tmp.offset.y : tmp.offset.height;
		events.bind(true);
		el.aclass(cls + '-selected');
	};

	events.onup = function() {
		$(document.body).rclass(cls + '-noscroll');
		self.rclass(cls + '-mousedown');
		movable.el.rclass(cls + '-selected');
		movable.is = false;
		events.bind();
		self.resize_container();
		movable.changed && self.modified();
	};

	events.onmove = function(e) {

		if (!movable.is)
			return;

		if (movable.istouch)
			e = e.touches[0];

		var obj = cache[movable.id];
		var diffX = e.pageX - movable.pageX;
		var diffY = e.pageY - movable.pageY;
		var axis = diffX !== 0 ? 'x' : diffY !== 0 ? 'y' : '';

		movable.changed = true;

		diffX = diffX / pixel >> 0;
		diffY = diffY / pixel >> 0;

		// RESIZE
		if (movable.type === 2) {

			diffX = movable.x + diffX;
			diffY = movable.y + diffY;

			if (diffX <= 0)
				diffX = 1;

			if (diffY <= 0)
				diffY = 1;

			var tmp = diffX + obj.offset.x;
			if (tmp >= config.axisX) {
				tmp = tmp - (tmp - config.axisX) - obj.offset.x;
				diffX = tmp;
			}

			tmp = diffY + obj.offset.y;
			if (tmp >= config.axisY) {
				tmp = tmp - (tmp - config.axisY) - obj.offset.y;
				diffY = tmp;
			}

			if (obj.meta.actions.resizeX == null || obj.meta.actions.resizeX)
				obj.offset.width = diffX;

			if (obj.meta.actions.resizeY == null || obj.meta.actions.resizeY)
				obj.offset.height = diffY;

			if (obj.meta.actions.resizeP) {
				if (axis === 'x') {
					obj.offset.width = diffX;
					obj.offset.height = diffX;
				} else if (axis === 'y') {
					obj.offset.width = diffY;
					obj.offset.height = diffY;
				}
			}

			var min = config['minsize' + current_display];

			if (obj.offset.width < min)
				obj.offset.width = min;

			if (obj.offset.height < min)
				obj.offset.height = min;

			self.woffset(movable.id);
			return;
		}

		diffX = movable.x + diffX;
		diffY = movable.y + diffY;

		if (diffX < 0)
			diffX = 0;

		if (diffY < 0)
			diffY = 0;

		var maxX = diffX + obj.offset.width;
		var maxY = diffY + obj.offset.height;

		if (maxX > config.axisX)
			diffX = config.axisX - obj.offset.width;

		if (maxY > config.axisY)
			diffY = config.axisY - obj.offset.height;

		obj.offset.x = diffX;
		obj.offset.y = diffY;

		self.woffset(movable.id);
	};

	self.destroy = function() {
		$D.off('dragstart', '[draggable]', drag.handler);
		$D.off('touchstart', '[draggable]', drag.handler);
		$D.off('mousedown touchstart', cls2 + '-title,' + cls2 + '-resize-button', events.down);
		$W.off('resize', events.resize);
		events.bind();
		clearInterval(serviceid);
		self.change(true);
	};

	self.resize_container = function() {

		var max = 0;

		for (var key in cache) {
			var item = cache[key];
			var y = (+item.container.css('top').replace('px', '')) + (+item.container.css('height').replace('px', ''));
			max = Math.max(y, max);
		}

		var h = config.parent ? self.parent(config.parent).height() : 0;
		max += 20;
		self.css('height', max < h ? h : max);
	};

	self.resize_pixel = function() {
		current_display = WIDTH(self.element);
		var width = self.element.width() - (config.padding * 2);
		pixel = (width / config.axisX).floor(3);
	};

	self.resize = function() {
		current_display = WIDTH(self.element);
		self.resize_pixel();
		for (var key in cache)
			self.woffset(key);
		self.resize_container();
	};

	self.resize2 = function() {
		setTimeout2(self.ID + 'resize', self.resize, 500);
	};

	self.wsize = function(d, offset) {

		var tmp = offset[d];
		if (!tmp) {
			if (d === 'xs')
				d = 'sm';
			tmp = offset[d];
			if (!tmp) {
				d = 'md';
				tmp = offset[d];
				if (!tmp) {
					d = 'lg';
					tmp = offset[d];
				}
			}
		}

		if (tmp)
			tmp = CLONE(tmp);
		else
			tmp = { x: 0, y: 0, width: 3, height: 3 };

		var min = config['minsize' + current_display];

		if (tmp.width < min)
			tmp.width = min;

		if (tmp.height < min)
			tmp.height = min;

		return tmp;
	};

	self.modified = function() {
		skip = true;
		self.change(true);
		self.update(true);
	};

	self.wdestroy = function(id, bind) {
		var obj = cache[id];
		if (obj) {
			delete cache[id];
			var el = obj.container;
			obj.meta.destroy && obj.meta.destroy.call(obj, obj.element);
			el.find('*').off();
			el.off();
			el.remove();
			var index;
			if (bind) {
				var model = self.get();
				index = model.indexOf(obj.meta);
				if (index !== -1) {
					model.splice(index, 1);
					self.modified();
				}
			}
			index = services.indexOf(obj);
			if (index !== -1)
				services.splice(index, 1);
			index = data.indexOf(obj);
			if (index !== -1)
				data.splice(index, 1);
		}
	};

	var resizewidget = function(obj) {
		if (obj && obj.meta) {
			obj.meta.resize && obj.meta.resize.call(obj, obj.width, obj.height, obj.element, obj.display);
			!config.noemitresize && obj.element.EXEC('resize');
		}
	};

	var click = function() {
		var el = $(this);
		if (el.css('z-index') !== '2') {
			self.find(cls2 + '-item').css('z-index', '');
			el.css('z-index', 2);
		}
	};

	self.woffset = function(id, init) {

		var d = current_display;
		var obj = cache[id];
		var tmp = self.wsize(d, obj.meta.offset);

		obj.offset = tmp;

		var x = tmp.x * pixel + config.padding;
		var y = tmp.y * pixel + config.padding;
		var w = tmp.width * pixel;
		var h = tmp.height * pixel;
		var classes = [];

		classes.push('d_col' + tmp.width);
		classes.push('d_row' + tmp.height);
		classes.push('d_' + tmp.width + 'x' + tmp.height);

		if (tmp.width === 1 && tmp.height > 1)
			classes.push('d_vertical');

		if (tmp.width > 1 && tmp.height === 1)
			classes.push('d_horizontal');

		if (tmp.width === tmp.height)
			classes.push('d_square');

		var fs = ((((Math.min(tmp.width, tmp.height) / 12) * 100) * pixel).floor(3) / 80);
		obj.container.css({ left: x, top: y, width: w, height: h, 'font-size': fs + 'px' });

		var body = obj.container.find('> ' + cls2 + '-body').rclass2('d_').aclass(classes.join(' '));
		var title = body.find('> ' + cls2 + '-title').height() || 0;
		var prevw = obj.width;
		var prevh = obj.height;

		obj.meta.offset[current_display] = tmp;
		obj.meta.height = obj.height = h - title - config.padding * 2;
		obj.meta.width = obj.width = obj.element.width();
		obj.meta.display = obj.display = d;
		obj.element.css({ height: obj.height });

		if (!init && (prevw !== obj.width || prevh !== obj.height))
			setTimeout(resizewidget, 2, obj);
	};

	self.send = function(id, body) {
		var comid = id.charAt(0) === '@' ? id.substring(1) : '';
		for (var i = 0; i < data.length; i++) {
			var item = data[i];
			if (id == null || item.meta.id === id || (comid && comid === item.meta.component))
				item.meta.data(body, item.element);
		}
	};

	self.wupd = function(id) {
		var obj = cache[id];
		var meta = obj.meta;
		var el = obj.container;
		el.tclass(cls + '-header', meta.header !== false);
		el.tclass(cls + '-canremove', meta.actions.remove !== false);
		el.tclass(cls + '-canresize', meta.actions.resize !== false);
		el.tclass(cls + '-cansettings', meta.actions.settings !== false);
		self.woffset(id);
	};

	var wanim = function(el) {
		el.rclass('invisible').aclass(cls + '-' + config.animation + '-run');
	};

	var winit = function(el, obj, isinit) {
		if (isinit && config.animation) {
			var def = isMOBILE ? 40 : 100;
			var delay = obj ? (def * (obj.offset.x + 1)) + (def * (obj.offset.y) + 1) : 10;
			setTimeout(wanim, delay, el);
		} else
			el.rclass('invisible');
	};

	self.wadd = function(obj) {

		var classname = [cls + '-item'];

		if (obj.actions.resize !== false)
			classname.push(cls + '-canresize');

		if (obj.actions.remove !== false)
			classname.push(cls + '-canremove');

		if (obj.actions.settings !== false)
			classname.push(cls + '-cansettings');

		if (obj.header !== false)
			classname.push(cls + '-header');

		classname.push('d-' + obj.component);

		var isdom = obj.html && typeof(obj.html) !== 'string';
		var el = $(('<div class="{1} invisible{6}" data-id="{2}"><div class="{0}-body" style="margin:{5}px"><div class="{0}-title">{4}</div><figure>{3}</figure><span class="{0}-resize-button"></span></div></div>').format(cls, classname.join(' '), obj.id, isdom ? '' : obj.html, ('<span class="{1} ui-dashboard-control" data-name="remove"></span><span class="{0} ui-dashboard-control" data-name="settings"></span>').format(config.iconsettings, config.iconremove) + '<div>' + obj.title + '</div>', config.padding, config.animation && isinit ? (' ' + cls + '-' + config.animation + '-init') : ''));
		self.dom.appendChild(el[0]);
		el.on('click', click);
		var tmp = cache[obj.id] = {};
		tmp.container = el;
		tmp.element = el.find('figure');
		isdom && tmp.element[0].appendChild(obj.html);
		tmp.config = tmp.options = obj.config;
		tmp.template = obj.template;
		tmp.cachedconfig = STRINGIFY(obj.config);
		tmp.meta = obj;
		tmp.main = self;
		self.woffset(obj.id, true);

		obj.element = tmp.element;
		obj.refresh = function() {
			var t = this;
			var container = t.element.closest(cls2 + '-item');
			var actions = t.actions;
			container.tclass(cls + '-canresize', actions.resize !== false);
			container.tclass(cls + '-canremove', actions.remove !== false);
			container.tclass(cls + '-cansettings', actions.settings !== false);
			container.tclass(cls + '-header', actions.header !== false);
		};

		tmp.meta.make && tmp.meta.make.call(tmp, tmp.meta, tmp.config, tmp.element);
		el[0].$dashboard = tmp;

		if (!isdom && obj.html)
			obj.html.COMPILABLE() && COMPILE();

		tmp.meta.service && services.push(tmp);
		tmp.meta.data && data.push(tmp);
		setTimeout(winit, obj.delay || config.delay, el, tmp, isinit);
	};

	self.setter = function(value) {

		if (skip) {
			skip = false;
			return;
		}

		if (!value)
			value = EMPTYARRAY;

		self.resize_pixel();
		services = [];
		data = [];

		for (var key in cache) {
			if (!value.findItem('id', key)) {
				self.wdestroy(key);
				delete cache[key];
			}
		}

		for (var i = 0; i < value.length; i++) {
			var obj = value[i];
			var item = cache[obj.id];
			if (item) {
				if (item.meta === obj) {

					self.wupd(obj.id);

					var tmp = STRINGIFY(obj.config);
					if (obj.configure && item.cachedconfig !== tmp) {
						item.cachedconfig = tmp;
						item.config = obj.config;
						obj.configure && obj.configure(item.config);
					}

					obj.service && services.push(item);
					obj.data && data.push(item);
					continue;
				} else
					self.wdestroy(obj.id);
			}
			self.wadd(obj);
		}

		if (value.length)
			isinit = false;

		self.resize_container();
	};

});
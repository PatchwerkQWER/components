COMPONENT('part', 'hide:1;loading:1;delay:500', function(self, config, cls) {

	var init = false;
	var clid = null;
	var downloading = false;
	var isresizing = false;

	self.releasemode && self.releasemode('true');
	self.readonly();

	self.make = function() {
		self.aclass(cls);
	};

	self.resize = function() {
		if (config.absolute) {
			var pos = self.element.position();
			var obj = {};
			obj.width = WW - pos.left;
			obj.height = WH - pos.top;
			self.css(obj);
		}
	};

	var replace = function(value) {
		return self.scope ? self.makepath(value) : value.replace(/\?/g, config.if);
	};

	self.setter = function(value) {

		if (config.if !== value) {

			if (!self.hclass('hidden')) {
				config.hidden && EXEC(replace(config.hidden));
				config.hide && self.aclass('hidden' + (config.invisible ? ' invisible' : ''));
				self.release(true);
			}

			if (config.cleaner && init && !clid)
				clid = setTimeout(self.clean, config.cleaner * 60000);

			return;
		}

		if (config.absolute && !isresizing) {
			self.on('resize2', self.resize);
			isresizing = true;
		}

		if (self.dom.hasChildNodes()) {

			if (clid) {
				clearTimeout(clid);
				clid = null;
			}

			self.release(false);

			var done = function() {
				config.hide && self.rclass('hidden');
				config.reload && EXEC(replace(config.reload));
				config.default && DEFAULT(replace(config.default), true);
				self.hclass('invisible') && self.rclass('invisible', config.delay);
				isresizing && setTimeout(self.resize, 50);
				setTimeout(self.emitresize, 200);
			};

			if (config.check)
				EXEC(replace(config.check), done);
			else
				done();

		} else {

			if (downloading)
				return;

			config.loading && SETTER('loading', 'show');
			downloading = true;
			setTimeout(function() {

				var preparator;

				if (config.replace)
					preparator = GET(replace(config.replace));
				else {
					preparator = function(content) {
						return content.replace(/~PATH~/g, replace(config.path || config.if));
					};
				}

				self.import(replace(config.url), function() {

					downloading = false;

					if (!init) {
						config.init && EXEC(replace(config.init));
						init = true;
					}

					var done = function() {
						config.hide && self.rclass('hidden');
						self.release(false);
						config.reload && EXEC(replace(config.reload), true);
						config.default && DEFAULT(replace(config.default), true);
						config.loading && SETTER('loading', 'hide', self.delay);
						self.hclass('invisible') && self.rclass('invisible', self.delay);
						isresizing && setTimeout(self.resize, 50);
						setTimeout(self.emitresize, 200);
					};

					EMIT('parts.' + config.if, self.element, self);

					if (config.check)
						EXEC(replace(config.check), done);
					else
						done();

				}, true, preparator);

			}, 200);
		}
	};

	self.emitresize = function() {
		self.element.SETTER('*', 'resize');
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'if':
				config.if = value + '';
				break;
			case 'absolute':
				var is = !!value;
				self.tclass(cls + '-absolute', is);
				break;
		}
	};

	self.clean = function() {
		if (self.hclass('hidden')) {
			config.clean && EXEC(replace(config.clean));
			setTimeout(function() {
				self.empty();
				init = false;
				clid = null;
				setTimeout(FREE, 1000);
			}, 1000);
		}
	};
});
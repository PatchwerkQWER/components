COMPONENT('edit', 'type:dblclick;id:data-id', function(self, config, cls) {

	self.readonly();

	self.make = function() {
		self.aclass(cls);
		self.event(config.type, '.edit', function(e) {

			var t = this;
			var el = $(t);
			var opt = (el.attrd('edit') || '').parseConfig();

			opt.element = opt.el = el;
			opt.event = e;
			opt.model = self.path ? self.get() : null;
			opt.path = self.path;
			opt.component = self;

			if (config.id) {
				var attr = config.id;
				while (t) {

					if (t === self.dom)
						break;

					var val = t.getAttribute(attr);
					if (val) {
						opt.id = val;
						opt.parent = $(t);
						break;
					}

					t = t.parentNode;
				}
			}

			self.EXEC(opt.exec || config.exec, opt, e);
		});
	};

});
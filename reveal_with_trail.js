(function ($) {
    "use strict";
    var scriptTag = document.getElementById('ceros-reveal-with-trail-plugin');
    var radius = scriptTag.getAttribute('data-circle-radius');
    require.config({
        paths: {
            CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
        },
    });
    require(["CerosSDK"], function (CerosSDK) {
        CerosSDK.findExperience()
            .fail(function (error) {
                console.error(error);
            })
            .done(function (experience) {
                window.myExperience = experience;

                var images = experience.findComponentsByTag("image");
                images.components.forEach(function (component) {
                    var id = "#" + component.id;
                    $(id).addClass("cursor");
                });

                setTimeout(function () {
                    var elements = document.getElementsByClassName("cursor");
                    for (var i = 0; i < elements.length; i++) {
                        var id = elements[i].id;
                        var image = document.getElementById(id).childNodes[0];

                        var imgDiv = document.getElementById(id);
                        var imageWidth = image.width;
                        var imageHeight = image.height;

                        var canvas = document.createElement("canvas");
                        var c = canvas.getContext("2d");
                        canvas.className = "canvasId";
                        canvas.width = imageWidth;
                        canvas.height = imageHeight;

                        image.classList.add("img");

                        new MouseFollow(elements[i], canvas, imgDiv, imageHeight, imageWidth, image, c);
                    }
                }, 100);

                var MouseFollow = function (el, canvas, imgDiv, imageHeight, imageWidth, image, c) {
                    this.el = el;
                    this.canvas = canvas;
                    this.imgDiv = imgDiv;
                    this.imageHeight = imageHeight;
                    this.imageWidth = imageWidth;
                    this.image = image;
                    this.c = c;
                    if (this.image.complete) {
                        start.call(this);
                    } else {
                        this.image.onload = start.call(this);
                    }    
                };

                var start = function() {
                    var that = this;
                    this.imgDiv.insertBefore(this.canvas, this.image);
                    this.canvas.addEventListener("mousemove", function (event) {
                        mouseMove(event, that);
                    });
                    document.addEventListener("touchmove", function (event) {
                        touchMove(event, that);
                    });
                    this.canvas.addEventListener("touchend", function (event) {
                        clearCircles(event, that);
                    });
                    this.canvas.addEventListener("mouseout", function (event) {
                        clearCircles(event, that);
                    });
                    this.canvas.style.position = 'absolute';
                    this.image.style.visibility = 'hidden';
                    this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.c.globalCompositeOperation = "source-over";
                    this.c.drawImage(this.image, 0, 0, this.imageWidth, this.imageHeight);
                };

                var drawCircle = function (x, y) {
                    var c = this.canvas.getContext("2d");
                    c.clearRect(0, 0, this.width, this.height);
                    c.globalCompositeOperation = "source-over";

                    c.drawImage(this.image, 0, 0, this.imageWidth, this.imageHeight);

                    c.globalCompositeOperation = "destination-out";

                    var fillColor = "#ff0000";
                    var radiusNum = radius || 150;
                    c.globalCompositeOperation = "destination-out";
                    c.fillStyle = fillColor;
                    c.beginPath();
                    c.arc(x, y, radiusNum, 0, 2 * Math.PI, false);

                    c.fill();

                    c.lineWidth = 4;
                    c.strokeStyle = "rgba(0, 0, 0, 0)";
                    c.stroke();
                };

                function mouseMove(event, that) {
                    var transform = window.getComputedStyle($(".page-viewport")[0]).transform;
                    var scale = parseFloat(transform.replace("matrix(", "").split(",")[0]);
                    if (scale === undefined || isEmpty(scale)) {
                        scale = window.getComputedStyle($(".page-viewport")[0]).zoom;
                    }
                    if (scale === undefined || isEmpty(scale)) {
                        scale = 1;
                    }
                    var BB = that.canvas.getBoundingClientRect();
                    var offsetX = BB.left + window.pageXOffset;
                    var offsetY = BB.top + window.pageYOffset;

                    var x = parseFloat(event.clientX - offsetX) / scale;
                    var y = parseFloat(event.clientY - offsetY) / scale;
                    drawCircle.call(that, x, y);
                }

                var touchMove = function (event, that) {
                    var BB = that.canvas.getBoundingClientRect();
                    var offsetX = BB.left + window.pageXOffset;
                    var offsetY = BB.top + window.pageYOffset;
                    var scaleX = that.imageWidth / that.canvas.getBoundingClientRect().width;
                    var scaleY = that.imageHeight / that.canvas.getBoundingClientRect().height;
                    if (scaleX > 1) {
                        var x = (event.touches[0].pageX - offsetX) * scaleX;
                    } else {
                        var x = (event.touches[0].pageX - offsetX) / scaleY;
                    }
                    if (scaleY > 1) {
                        var y = (event.touches[0].pageY - offsetY) * scaleY;
                    } else {
                        var y = (event.touches[0].pageY - offsetY) / scaleY;
                    }
                    drawCircle.call(that, x, y);
                };

                var clearCircles = function (event, that) {
                    that.c.clearRect(0, 0, that.canvas.width, that.canvas.height);
                    that.c.globalCompositeOperation = "source-over";
                    that.c.drawImage(that.image, 0, 0, that.imageWidth, that.imageHeight);
                };

                function isEmpty(str) {
                    return !str || 0 === str.length;
                }
            });
    });
})(jQuery);
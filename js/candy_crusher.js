var CandyCrusher = (function () {
    "use strict";
    var stage,
        renderer,
        loader = new PIXI.AssetLoader(['js/candies.json', 'js/hole.json', 'js/explosion.json']),
        GRID_WIDTH = 3,
        GRID_HEIGHT = 3,
        GRID_ELE_WIDTH = 167,
        GRID_ELE_HEIGHT = 100,
        CANDY_AMOUNT = 12,
        GRID = [[], [], []],
        FIELD_OFFSET = 100,
        LAYER_BG = new PIXI.DisplayObjectContainer(),
        LAYER_CANDY = new PIXI.DisplayObjectContainer(),
        LAYER_FG = new PIXI.DisplayObjectContainer(),
        tk = (new Date()).getTime(),
        score = 0,
        prevCandy = null,
        scoreText = null,
        explosionTextures = [];

    function GridElement(x, y) {
        var texture_top = PIXI.Texture.fromFrame('hole_top.png'),
            texture_bottom = PIXI.Texture.fromFrame('hole_bottom.png'),
            hole_top = new PIXI.Sprite(texture_top),
            hole_bottom = new PIXI.Sprite(texture_bottom);

        hole_top.position.x = x * GRID_ELE_WIDTH;
        hole_top.position.y = FIELD_OFFSET + y * GRID_ELE_HEIGHT;

        hole_bottom.position.x = x * GRID_ELE_WIDTH;
        hole_bottom.position.y = FIELD_OFFSET + y * GRID_ELE_HEIGHT + 57;

        LAYER_BG.addChild(hole_top);
        LAYER_FG.addChild(hole_bottom);

        var texture = PIXI.Texture.fromFrame('candy' + Math.floor((Math.random()*CANDY_AMOUNT)+1)+ '.png'),
            candy = new PIXI.Sprite(texture),
            original_height = candy.height;

        candy.height = 0;
        candy.position.x = hole_top.position.x + 30;
        candy.position.y = hole_top.position.y + 100;
        candy.visible = false;
        candy.setInteractive(true);
        candy.click = function (evt) {
            score += 1;
            destroyCandy(evt.global.x, evt.global.y);
        };
        LAYER_CANDY.addChild(candy);

        function destroyCandy(x, y) {
            candy.visible = false;
            candy.height = 0;
            var explosion = new PIXI.MovieClip(explosionTextures);
            explosion.rotation = Math.random() * Math.PI;
            explosion.anchor = new PIXI.Point(0.5, 0.5);
            explosion.scale.x = explosion.scale.y = 0.5;
            explosion.position.x = x;
            explosion.position.y = y;
            explosion.loop = false;
            explosion.onComplete = function () {
                stage.removeChild(explosion);
            };
            explosion.play();
            stage.addChild(explosion);
        }

        return {
            showCandy: function () {
                var texture = PIXI.Texture.fromFrame('candy' + Math.floor((Math.random()*CANDY_AMOUNT)+1)+ '.png');
                candy.setTexture(texture);
                candy.visible = true;
                var timeLine = new TimelineLite(),
                    tweens = [
                        new TweenLite(candy.position, 0.5, {y: candy.position.y - original_height}),
                        new TweenLite(candy, 0.5, {height: original_height})
                    ];
                timeLine.insertMultiple(tweens, 0, 'start');
                timeLine.play();
            },
            hideCandy: function () {
                var timeLine = new TimelineLite({onComplete: function () {
                        candy.visible = false;
                    }}),
                    tweens = [
                        new TweenLite(candy.position, 0.5, {y: candy.position.y + original_height}),
                        new TweenLite(candy, 0.5, {height: 0})
                    ];
                timeLine.insertMultiple(tweens, 0, 'start');
                timeLine.play();
            }
        };
    }

    function loadGrid() {
        var i,
            j;

        for (i = 0; i < GRID_HEIGHT; i += 1) {
            for (j = 0; j < GRID_WIDTH; j += 1) {
                GRID[i][j] = new GridElement(i, j);
            }
        }
    }

    return {
        start: function () {
            stage = new PIXI.Stage(0x000000);
            renderer = PIXI.autoDetectRenderer(500, 400);

            var button = document.getElementById('start');
            button.style.display = 'none';

            var holder = document.getElementById('game');
            holder.appendChild(renderer.view);

            function loaded() {
                for (var i=0; i < 26; i++) {
                    var texture = PIXI.Texture.fromFrame("Explosion_Sequence_A " + (i+1) + ".png");
                    explosionTextures.push(texture);
                }
                loadGrid();
                prevCandy = GRID[Math.floor((Math.random()*3))][Math.floor((Math.random()*3))];
            }
            loader.onComplete = loaded;
            loader.load();

            scoreText = new PIXI.Text("Score: " + score, {font:"90px Candice", fill:"white"});
            stage.addChild(scoreText);
            stage.addChild(LAYER_BG);
            stage.addChild(LAYER_CANDY);
            stage.addChild(LAYER_FG);

            requestAnimFrame(this.animate.bind(this));
        },
        animate: function () {
            requestAnimFrame(this.animate.bind(this));

            var delta = (new Date()).getTime() - tk;

            if (delta > 2000) {
                tk = (new Date()).getTime();
                prevCandy.hideCandy();
                prevCandy = GRID[Math.floor((Math.random()*3))][Math.floor((Math.random()*3))];
                prevCandy.showCandy();
            }

            scoreText.setText("Score: " + score);

            renderer.render(stage);
        }
    };
}());

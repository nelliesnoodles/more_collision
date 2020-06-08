// For singing in the rain example

let DOM = {
    'count': 0,
    'width': 0,
    'height': 0,
    'canvas': '',
    'ctx': '',
    'rain1_coord': [],
    'rain2_coord': [],
    'rain3_coord': [],
    'shield_coord': [],
    'rain_image': 'rain.png',
    'umbrella_image': 'umbrella.png',
    'x_positions': [],
    'y_positions': [],
    'collision': false,
    'x_coord': '',
    'y_coord': '',
    'shield_tile_width': 50,
    'shield_tile_height': 30,
    'rain_width': 30,
    'rain_height': 30,
    'direction': 1,
    'speed': 10,


}


function set_DOM() {
    let mycanvas = document.getElementById('rain_canvas');
    DOM.width = mycanvas.width;
    DOM.height = mycanvas.height;
    DOM.canvas = mycanvas;
    DOM.ctx = mycanvas.getContext("2d");
    DOM.count = 0;
    DOM.x_coord = document.getElementById('x-coord');
    DOM.y_coord = document.getElementById('y-coord');
   
    // --- Initial Rain coordinates ---
    let spacing = DOM.width / 6
    let start_y = DOM.height - DOM.rain_height
    let rain1_x = spacing
    let rain2_x = spacing * 2 + DOM.rain_width
    let rain3_x = spacing * 4 + DOM.rain_width
    DOM.rain1_coord[0] = rain1_x
    DOM.rain1_coord[1] = start_y
    DOM.rain2_coord[0] = rain2_x
    DOM.rain2_coord[1] = start_y
    DOM.rain3_coord[0] = rain3_x
    DOM.rain3_coord[1] = start_y

}

function set_coords_shield(shield_x) {
    let bottom = DOM.height;
    let shield_list = DOM.shield_coord
    shield_list[0] = shield_x
    shield_list[1] = bottom

}

function update_count() {
    add_count()
    let counter = document.getElementById('count')
    counter.innerHTML = DOM.count
}

function add_count() {
    DOM.count += 1

}

function update_coords(x_inpage, y_inpage) {
    x_element = document.getElementById('x-coord')
    y_element = document.getElementById('y-coord')
    x_element.innerHTML = x_inpage
    y_element.innerHTML = y_inpage

}

class Collision {
    /*
     * item_x, item_y  
     * item2_x, item2_y
     * Check if the coordinates are within range of each other, or collide     * 
     */
    constructor(item_x, item_y, item2_x, item2_y) {
        this.item_x = item_x
        this.item_y = item_y
        this.item2_x = item2_x
        this.item2_y = item2_y
    }

    set_range(range_x, range_y) {
        this.range_x = range_x
        this.range_y = range_y
    }

    check_collide_x() {
        /*
         * If the x, y of the class items are within range of each other,
         * return a True for collision detected, False if they are not within range
         */
        var check_x = Math.abs(this.item_x - this.item2_x)

        if (check_x <= this.range_x) {
            return true
        }
        return false
    }

    check_collide_y() {
        var check_y = Math.abs(this.item_y - this.item2_y)
        if (check_y <= this.range_y) {
            return true
        }
        return false

    }
    check_all_xy() {
        let collision_on_x = this.check_collide_x()
        let collision_on_y = this.check_collide_y()
        if (collision_on_x || collision_on_y) {
            return true
        }
        return false
    }
    get_coords() {
        var difference_x = Math.abs(this.item_x - this.item2_x)
        var difference_y = Math.abs(this.item_y - this.item2_y)
        var new_y = this.item_y - difference_y
        var new_x = this.item_x - difference_x
        if (this.item_y <= this.item2_y) {
            new_y = this.item2_y + difference_y
        }
        if (this.item_x <= this.item2_x) {
            new_x = this.item2_x + difference_x
        }
        let coords = [new_x, new_y]
        return coords

        
    }
}

function draw_collison(x_line) {
    let mycanvas = document.getElementById('rain_canvas');
    let ctx = mycanvas.getContext("2d");
    let umb_height = DOM.height - DOM.shield_tile_height
    /*  Draw a line on the x-axis 
     *  and on the y-axis to show viewers where the collision occured
     *  clear the screen to clean up some junk image leftovers I can't seem to clear up currently
     */

    ctx.clearRect(0, 0, mycanvas.width, mycanvas.height)
    //draw the y axis line
    // this was not working well with given coordinates from collision,
    // I'm going to move it to the y-axis of the umbrella height.
    ctx.beginPath()
    ctx.moveTo(x_line, 0)
    ctx.lineTo(x_line, mycanvas.height)
    ctx.stroke()
    //draw the x axis line
    ctx.beginPath()
    ctx.moveTo(0, umb_height)
    ctx.lineTo(mycanvas.width, umb_height)
    ctx.stroke()
}

function move_umbrella() {
    let speed = 10
    let max = DOM.width - DOM.shield_tile_width - speed
    let min = 0
    let coordinates = DOM.shield_coord
    let x_move = coordinates[0]
   
    //y does not change, there for does not need to be assessed
    //let y_move = coordinates[1]
    if (x_move > max) {
        DOM.direction = -1
    }
    if (x_move < min) {
        DOM.direction = 1
    }
    DOM.shield_coord[0] += speed * DOM.direction
    
}

function clear_rain(rain_coords) {
    let x_rain = rain_coords[0]
    let y_rain = rain_coords[1]
    let end_rain_x = rain_coords[2]
    let end_rain_y = rain_coords[3]
    let ctx = DOM.ctx
    // clear the space the rain previously occupied
    ctx.clearRect(x_rain, y_rain, end_rain_x, end_rain_y)

}

function move_rain(rain_list) {/*
 * Drop the rain on the y axis
 * If the images x coordinate comes in range
 * of the umbrella's x coordinate, note a 
 * collision. 
 */
    //-- create list to send to the ctx clearRect
    // I know what my sizes are, but if the sizes of images are different,
    // the size variables will need to be passed in to calculate the end_points of image
    // the size of my rain is 30 by 30

    var size = 30
    var speed = 10
    //the top left is the coordinates the image draw starts at, or the x, y
    // clear the old rain, before the new rain is drawn, and before the new coordinates
    // are set by either collision with boundary, bottom of canvas, or with umbrella
    let start_x = rain_list[0]
    let start_y = rain_list[1] - speed
    let end_x = rain_list[0] + size
    let end_y = rain_list[1] + size
    let rain_coords = [start_x, start_y, end_x, end_y]
    clear_rain(rain_coords)
   
   
    //-- some math to determine if collison is near
    let max = DOM.height - DOM.shield_tile_height    
    let rain_x = rain_list[0]
    let rain_y = rain_list[1]
    let umbrella_x = DOM.shield_coord[0]
    let umbrella_y = DOM.shield_coord[1]
   
    let collision = new Collision(rain_x, rain_y, umbrella_x, umbrella_y)
    collision.set_range(40, 30)
    let collision_on_x = collision.check_collide_x()
    let collision_on_y = collision.check_collide_y()

    //console.log(`collision on x = ${collision_on_x}`)
    //console.log(`collision on y = ${collision_on_y}`)
    
    if (collision_on_y && collision_on_x) {
        //console.log("COLLISION")
        rain_list[1] = 0
        // Removed the use of Collision y coordinates returned here
        coords = collision.get_coords()
        draw_collison(coords[0])
        update_count()
        update_coords(coords[0], coords[1])
        
    }
    else if (rain_y >= max) {
        rain_list[1] = 0
        
    }
    else {
        rain_list[1] += 10
    }
    
}

function draw_rain(rain_list) {
    rain = new Image()
    //May not use DOM.rain_image instead using direct source
    rain.src = 'rain.png'
    
    let x_rain = rain_list[0]
    let y_rain = rain_list[1]
    let ctx = DOM.ctx

    
   
    
    rain.onload = () => {
        ctx.drawImage(rain, x_rain, y_rain, 30, 30)
        //console.log(`x of rain = ${x_rain}`)
        //console.log(`y of rain = ${y_rain}`)
    }
    move_rain(rain_list)

}


function draw_umbrella() {
    shield = new Image()
    shield.src = 'umbrella.png'
    let shield_pos = DOM.shield_coord
    let direction = DOM.direction
    var top_x = shield_pos[0]
    if (direction > 0) {
        top_x = shield_pos[0] - 10
    }
    
    let bottom= DOM.height
    let top_y = DOM.height - DOM.shield_tile_height
    let end = DOM.width
    
    let shield_w = DOM.shield_tile_width
    let shield_h = DOM.shield_tile_height
    //console.log(`shield_pos = ${shield_pos}`)
    let mycanvas = document.getElementById('rain_canvas');
    let ctx = mycanvas.getContext("2d")
    //console.log(`x = ${shield_pos[0]}`)
    //console.log(`y = ${shield_pos[1]}`)
    //console.log(ctx)
    var x = shield_pos[0]
    //If either variable for position, x or y, is greater or less than the dimensions of canvas:
    // There will be no error, it will just place the image outside of view.
    var y = shield_pos[1]-shield_h

    ctx.clearRect(top_x, top_y, end, bottom);
    shield.onload = () => {
        ctx.drawImage(shield, x, y, shield_w, shield_h);

    }

    move_umbrella()
}

function animate() {
    let rain1_list = DOM.rain1_coord
    let rain2_list = DOM.rain2_coord
    let rain3_list = DOM.rain3_coord
    
    setInterval(draw_umbrella, 300)
    setInterval(draw_rain, 300, rain1_list)
    setInterval(draw_rain, 500, rain2_list)
    setInterval(draw_rain, 300, rain3_list)
}


function reset() {
    let center_width = DOM.width / 2
    //no offset required for center with image width
    set_coords_shield(center_width)

}




function log_DOM() {
    //stackoverflow: https://stackoverflow.com/questions/10654992/how-to-get-collection-of-keys-in-javascript-dictionary
    Object.entries(DOM).forEach(([key, value]) => {
        console.log(key, value);
    });

}

window.addEventListener('load', (event) => {
    set_DOM()
    reset()
    animate()
    //log_DOM()

});
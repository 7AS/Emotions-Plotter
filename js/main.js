let data = null;

// --------------------------------------------------
// Some const
// --------------------------------------------------

const screen_width = window.innerWidth;
const screen_height = window.innerHeight;

const load_play = document.getElementById( 'load_play' );
const statistics_button = document.getElementById( 'statistics_button' );
const statistics_anchor = document.getElementById( 'statistics_anchor' );
const polarity_button = document.getElementById( 'polarity_button' );
const polarity_anchor = document.getElementById( 'polarity_anchor' );
const others_button = document.getElementById( 'others_button' );
const others_anchor = document.getElementById( 'others_anchor' );

// List of Sentic's emotions
// Source https://sentic.net/images/hourglass-dimensions.jpg
const senticnet_emotions = [
    [ 'rage', 'anger', 'annoyance', 'serenity', 'calmness', 'bliss', ],
    [ 'ecstasy', 'joy', 'contentment', 'melancholy', 'sadness', 'grief' ],
    [ 'delight', 'pleasantness', 'acceptance', 'dislike', 'disgust', 'loathing' ],
    [ 'enthusiasm', 'eagerness', 'responsiveness', 'anxiety', 'fear', 'terror' ]
]

const personnality_aspects = [ 'introspection', 'temper', 'attitude', 'sensitivity' ];

// --------------------------------------------------
// Scrolls to different figures
// --------------------------------------------------

statistics_button.addEventListener( 'click', function () {
    statistics_anchor.scrollIntoView( {behavior: 'smooth'} );
});
polarity_button.addEventListener( 'click', function () {
    polarity_anchor.scrollIntoView( {behavior: 'smooth'} );
});
others_button.addEventListener( 'click', function () {
    others_anchor.scrollIntoView( {behavior: 'smooth'} );
});

// --------------------------------------------------
// Loads data from a CSV file and returns them (async)
// --------------------------------------------------

async function load_data ( csv ) {
    return d3.csv( csv ,function ( d ) {
        return {
            id: d.id,
            speaker: d.speaker,
            scene: +d.scene,
            primary_emotion: d.primary_emotion,
            secondary_emotion: d.secondary_emotion,
            polarity : +d.polarity,
            words: +d.words,
            introspection: +d.introspection,
            temper: +d.temper,
            attitude: +d.attitude,
            sensitivity: +d.sensitivity
        }
    }).then( function ( data ) {
        return data;
    });
}

// --------------------------------------------------
// (1.1.1) Histogram of speaker who spoke the most
// --------------------------------------------------

// Relative dimensions of the figure 1.1
let svg_1_1 = document.getElementById( 'svg_1_1' );
const svg_1_1_padding_lr = svg_1_1.clientWidth / 5;
const svg_1_1_padding_tb = svg_1_1.clientHeight / 3;
const svg_1_1_width = svg_1_1.clientWidth - svg_1_1_padding_lr;
const svg_1_1_height = svg_1_1.clientHeight - svg_1_1_padding_tb;

// Creates SVG
let svg = d3.select( '#svg_1_1' )
    .append( 'svg' )
        .attr( 'width', svg_1_1_width + svg_1_1_padding_lr )
        .attr( 'height', svg_1_1_height + svg_1_1_padding_tb )
    .append( 'g' )
        .attr( 'transform', `translate( ${ svg_1_1_padding_lr / 2 }, ${ svg_1_1_padding_tb / 5 } )` );

// --------------------------------------------------
// (1.1.2) Plots the histogram
// --------------------------------------------------

function bar_plot_amount ( data ) {
    // Prepares data for vizualisation
    let subgroups = [ 'words', 'speeches' ];
    let groups = [];
    let speaker_speeches_words = {}
    let sum_words = 0;
    let sum_speeches = 0;

    data.forEach( row => {
        // Adds new elements
        if ( speaker_speeches_words[row.speaker] ) {
            speaker_speeches_words[row.speaker].words += row.words;
            speaker_speeches_words[row.speaker].speeches += 1;

            sum_words += row.words;
            sum_speeches += 1;
        } else {
            speaker_speeches_words[row.speaker] = { words : row.words, speeches : 1 };

            sum_words += row.words;
            sum_speeches += 1;
        }

        // Adds character to array
        if ( groups.indexOf( row.speaker ) == -1 ) {
            groups.push( row.speaker );
        }
    });

    // Stores data properly
    let speaker_speeches_words_array = [];
    for( elt in speaker_speeches_words ) {
        speaker_speeches_words_array.push(
            {
                speaker : elt,
                speeches : speaker_speeches_words[elt].speeches,
                words : speaker_speeches_words[elt].words
            }
        )
    }

    // Converts to relative scale and finds max value
    let max_y = 0;

    for( let i = 0 ; i < speaker_speeches_words_array.length ; i++ ) {
        let new_words = 100 / sum_words * speaker_speeches_words_array[i].words;
        let new_speeches = 100 / sum_speeches * speaker_speeches_words_array[i].speeches;

        // Converts words in %
        speaker_speeches_words_array[i].words = new_words;

        // Converts speeches in %
        speaker_speeches_words_array[i].speeches = new_speeches;

        // Ajusts max if needed
        max_y = max_y < new_words ? new_words : max_y;
        max_y = max_y < new_speeches ? new_speeches : max_y;
    }

    // Removes previous data
    d3.selectAll( 'rect' ).remove();
    d3.selectAll( 'text' ).remove();

    // X
    const x = d3.scaleBand()
        .domain( groups )
        .range( [ 0, svg_1_1_width ] )
        .padding( [ 0.2 ] );

    svg.append( 'g' )
        .attr( 'transform', `translate( 0, ${svg_1_1_height} )` )
        .call( d3.axisBottom( x ).tickSize( 0 ) )
        .selectAll( 'text' )
            .attr( 'transform', 'translate(-10,5)rotate(-90)' )
            .style( 'text-anchor', 'end' );

    // Y
    const y = d3.scaleLinear()
        .domain( [ 0, max_y ] )
        .range( [ svg_1_1_height, 0 ] );

    svg.append( 'g' )
        .call( d3.axisLeft( y ).tickSize( 0 ) );

    // Subgroups
    const subgroup_x = d3.scaleBand()
        .domain( subgroups )
        .range( [ 0, x.bandwidth() ] )
        .padding( [ 0 ] );
        
    // Names Y axis
    svg.append( 'text' )
        .attr( 'text-anchor', 'middle' )
        .attr( 'transform', 'rotate(-90)')
        .attr( 'fill', 'white' )
        .attr( 'y', -35)
        .attr( 'x', - svg_1_1_padding_tb)
        .text( 'Percent' );

    // Colors
    const color = d3.scaleOrdinal()
        .domain( subgroups )
        .range( [ '#ff5b4d','#4ddbff' ] );

    // Shows the bars
    svg.append( 'g' )
        .selectAll( 'g' )
        .data( speaker_speeches_words_array )
        .join( 'g' )
            .attr( 'transform', d => `translate( ${ x( d.speaker ) }, 0 )` )
        .selectAll( 'rect' )
        .data( function( d ) { return subgroups.map( function( key ) { return { key : key, value : d[key] } } ); } )
        .join( 'rect' )
            .attr( 'x', d => subgroup_x( d.key ) )
            .attr( 'y', d => y( d.value ) )
            .attr( 'width', subgroup_x.bandwidth() )
            .attr( 'height', d => svg_1_1_height - y( d.value ) )
            .attr( 'fill', d => color( d.key ) );
}

// --------------------------------------------------
// (1.2.1) Bar plot of emotions extracted from speeches
// --------------------------------------------------

// Relative dimensions of the figure 1.2
let svg_1_2 = document.getElementById( 'svg_1_2' );
const svg_1_2_padding_lr = svg_1_2.clientWidth / 5;
const svg_1_2_padding_tb = svg_1_2.clientHeight / 3;
const svg_1_2_width = svg_1_2.clientWidth - svg_1_2_padding_lr;
const svg_1_2_height = svg_1_2.clientHeight - svg_1_2_padding_tb;

// Creates SVG
svg_1_2 = d3.select( '#svg_1_2' )
    .append( 'svg' )
        .attr( 'width', svg_1_2_width + svg_1_2_padding_lr )
        .attr( 'height', svg_1_2_height + svg_1_2_padding_tb )
    .append( 'g' )
        .attr( 'transform', `translate( ${ svg_1_2_padding_lr / 2 }, ${ svg_1_2_padding_tb / 5 } )` );

// X
const svg_1_2_x = d3.scaleBand()
    .range( [ 0, svg_1_2_width ] )
    .padding( 0.25 );

let xAxis = svg_1_2
    .append( 'g' )
    .attr( 'transform', `translate(0, ${ svg_1_2_height } )` )

// Y
const svg_1_2_y = d3.scaleLinear()
    .range( [ svg_1_2_height, 0] );

const yAxis = svg_1_2
    .append( 'g' );

// --------------------------------------------------
// (1.2.2) Updates figure 1.2
// --------------------------------------------------

function update_bar_plot_emotions ( data, act, scale ) {
    // Removes previous elements
    svg_1_2.selectAll( 'line' ).remove();

    // Splits dataset by selected act/scene
    let scenes = d3.max( data, d => d.scene );

    // Selects interest divs
    let vi2_type = document.getElementById( 'vi2_type' );
    let vi2_scale = document.getElementById( 'vi2_scale' );

    // If the act needs to be updated
    if ( act ) {
        let new_act = Number( vi2_type.getAttribute( 'value' ) ) + 1;

        // New text for act/scene
        let new_act_text = 'Act/scene ' + new_act;
        if ( new_act > scenes ) {
            new_act = 0;
            new_act_text = 'Whole play';
        }

        // Sets new value for act/scene
        vi2_type.setAttribute( 'value', new_act );
        vi2_type.innerText = new_act_text;
    }

    // If the scale needs to be updated
    if ( scale ) {
        let new_scale = ( Number( vi2_scale.getAttribute( 'value' ) ) + 1 ) % 2; // 0 = absolte ; 1 = relative

        // New text for scale
        let new_scale_text = '';
        if ( new_scale == 0 ) {
            new_scale_text = 'Absolute (count)'
        } else {
            new_scale_text = 'Relative (percent)'
        }

        // Sets the new value for scale
        vi2_scale.setAttribute( 'value', new_scale );
        vi2_scale.innerText = new_scale_text;
    }

    // Gets values used later
    let vi2_type_value = Number( vi2_type.getAttribute( 'value' ) );
    let vi2_scale_value = Number( vi2_scale.getAttribute( 'value' ) );
    let vi2_scale_text = vi2_scale.innerText;

    // Builds object for easy manipulation later
    let grouped_emotions = {};
    senticnet_emotions.forEach( row => {
        row.forEach( emo => {
            grouped_emotions[emo] = 0;
        })
    });

    // Sum of emotions (for relative scale)
    let sum_emotions = 0;

    // Loops through each speech and assign its emotions to the data to be plotted
    data.forEach( speech => {
        let sa = Number( speech.scene );
        let pe = speech.primary_emotion;
        let se = speech.secondary_emotion;

        // Does stuff based on the following conditions :

        // For the whole play
        if ( vi2_type_value == 0 ) {
            if ( pe != '' ) {
                if ( grouped_emotions[pe] >= 0 ) {
                    grouped_emotions[pe] += 1;
                    sum_emotions++;
                }
            }
            if ( se != '' ) {
                if ( grouped_emotions[se] >= 0 ) {
                    grouped_emotions[se] += 1;
                    sum_emotions++;
                }
            }
        }
        // For a specific act/scene
        if ( sa == vi2_type_value ) {
            if ( pe != '' ) {
                if ( grouped_emotions[pe] >= 0 ) {
                    grouped_emotions[pe] += 1;
                    sum_emotions++;
                }
            }
            if ( se != '' ) {
                if( grouped_emotions[se] >= 0 ) {
                    grouped_emotions[se] += 1;
                    sum_emotions++;
                }
            }
        }
    });

    // Converts to array of objects (instead of simple object)
    grouped_emotions = Object.entries( grouped_emotions );
    let emotions_object = [];
    grouped_emotions.forEach( e => { emotions_object.push( { emotion : e[0], count : e[1] } ); } );
    
    // Recomputes relative values if needed
    if ( vi2_scale_value ) {
        for( let i = 0 ; i < grouped_emotions.length ; i++ ){
            grouped_emotions[i][1] = 100 / sum_emotions*grouped_emotions[i][1];
        }
    }

    // Max for Y
    let max_y = 100;

    // Finds max (only if absolute scale, otherwise max is 100)
    if ( !vi2_scale_value ) {
        max_y = d3.max( emotions_object, d => d.count )
        max_y = max_y + Math.round( max_y / 10 )
    }

    // X
    svg_1_2_x.domain( grouped_emotions.map( d => d[0]) );        

    // Adds Y axis
    svg_1_2_y.domain( [ 0, max_y ] );
    yAxis
        .transition()
        .duration( 250 )
        .call( d3.axisLeft( svg_1_2_y ) );

    xAxis
        .transition()
        .duration( 250 )
        .call( d3.axisBottom( svg_1_2_x ) )
        .selectAll( 'text' )
            .attr( 'transform', 'translate(-10,15)rotate(-90)' )
            .style( 'text-anchor', 'end' );

    // Names Y axis
    svg_1_2.append( 'text' )
        .attr( 'text-anchor', 'middle' )
        .attr( 'transform', 'rotate(-90)' )
        .attr( 'fill', 'white' )
        .attr( 'y', -40 )
        .attr( 'x', -svg_1_2_padding_tb )
        .text( 'Count' );

    const u = svg_1_2.selectAll( 'rect' )
        .data( grouped_emotions );

    // Base colors :
        // Red : #ff5b4d
        // Orange : #ff974d
        // Yellow : #ffe14d
        // Green : #4dff6a
        // Cyan : #4dc3ff
        // Purple : #b24dff

    let colors = 
        {
            ecstasy:"#ffe14d", joy:"#dbdb71", contentment:"#b8d594", melancholy:"#94cfb8", sadness:"#71c9db", grief:"#4dc3ff",
            bliss:'#ff974d', calmness:'#ff8b4d', serenity:'#ff7f4d', annoyance:'#ff734d', anger:'#ff674d', rage:'#ff5b4d',
            delight:'#4dc3ff', pleasantness:'#4dcfe1', acceptance:'#4ddbc3', dislike:'#4de7a6', disgust:'#4df388', loathing:'#4dff6a',
            enthusiasm:'#4dff6a', eagerness:'#61db88', responsiveness:'#75b8a6', anxiety:'#8a94c3', fear:'#9e71e1', terror:'#b24dff'
        }

    // 1/4 line
    svg_1_2.append( 'line' )
        .style( 'stroke', 'white' )
        .style( 'stroke-width', 1 )
        .attr( 'x1', svg_1_2_width / 4 )
        .attr( 'y1', 0 )
        .attr( 'x2', svg_1_2_width / 4 )
        .attr( 'y2', svg_1_2_height );

    // 1/2 line
    svg_1_2.append( 'line' )
        .style( 'stroke', 'white' )
        .style( 'stroke-width', 1 )
        .attr( 'x1', svg_1_2_width / 2 )
        .attr( 'y1', 0 )
        .attr( 'x2', svg_1_2_width / 2 )
        .attr( 'y2', svg_1_2_height );

    // 3/4 line
    svg_1_2.append( 'line' )
        .style( 'stroke', 'white' )
        .style( 'stroke-width', 1 )
        .attr( 'x1', svg_1_2_width * .75 )
        .attr( 'y1', 0 )
        .attr( 'x2', svg_1_2_width * .75 )
        .attr( 'y2', svg_1_2_height );

    // Top line
    svg_1_2.append( 'line' )
        .style( 'stroke', 'white' )
        .style( 'stroke-width', 1 )
        .attr( 'x1', 0 )
        .attr( 'y1', 0 )
        .attr( 'x2', svg_1_2_width )
        .attr( 'y2', 0 );

    // End line
    svg_1_2.append( 'line' )
        .style( 'stroke', 'white' )
        .style( 'stroke-width', 1 )
        .attr( 'x1', svg_1_2_width )
        .attr( 'y1', 0 )
        .attr( 'x2', svg_1_2_width )
        .attr( 'y2', svg_1_2_height );

    // Names of groups of emotions
    svg_1_2.append( 'text' )
        .attr( 'text-anchor', 'middle' )
        .attr( 'fill', '#ff974d' )
        .attr( 'y', '2em' )
        .attr( 'x', svg_1_2_width / 8 )
        .attr( 'font-size', '.75em' )
        .text( 'Temper' );

    svg_1_2.append( 'text' )
        .attr( 'text-anchor', 'middle' )
        .attr( 'fill', '#ffe14d' )
        .attr( 'y', '2em' )
        .attr( 'x', svg_1_2_width / 8 * 3 )
        .attr( 'font-size', '.75em' )
        .text( 'Introspection' );

    svg_1_2.append( 'text' )
        .attr( 'text-anchor', 'middle' )
        .attr( 'fill', '#4dff6a' )
        .attr( 'y', '2em' )
        .attr( 'x', svg_1_2_width / 8 * 5 )
        .attr( 'font-size', '.75em' )
        .text( 'Attitude' );

    svg_1_2.append( 'text' )
        .attr( 'text-anchor', 'middle' )
        .attr( 'fill', '#b24dff' )
        .attr( 'y', '2em' )
        .attr( 'x', svg_1_2_width / 8 * 7 )
        .attr( 'font-size', '.75em' )
        .text( 'Sensitivity' );

    // Updates the bars
    u.join( 'rect' )
        .transition()
        .duration( 250 )
        .attr( 'x', d => svg_1_2_x( d[0] ) )
        .attr( 'y', d => svg_1_2_y( d[1] ) )
        .attr( 'width', svg_1_2_x.bandwidth() )
        .attr( 'height', d => svg_1_2_height - svg_1_2_y( d[1] ) )
        .attr( 'fill', d  => colors[ d[0] ] );
}

// Sets properties to zoom on both figures
[ document.getElementById( 'svg_1_1' ), document.getElementById( 'svg_1_2' ) ].forEach( elt => {
    elt.addEventListener( 'click', function () {
        if ( this.getAttribute( 'zoomed' ) == '0' ) {
            this.setAttribute( 'zoomed', '1' );
            this.style.transform = 'scale(1.25)';
        } else {
            this.setAttribute( 'zoomed', '0' );
            this.style.transform = 'scale(1)';
        }
    })
});

// Event listeners for figure 1.2
document.getElementById( 'vi2_type' ).addEventListener( 'click', function () {
    update_bar_plot_emotions( data, true, false );
});

document.getElementById( 'vi2_scale' ).addEventListener( 'click', function () {
    update_bar_plot_emotions( data, false, true );
});

// --------------------------------------------------
// (2.1) Creation of the polarity figure
// --------------------------------------------------

// Relative dimensions of the figure 2
let svg_2 = document.getElementById( 'svg_2' );

const svg_2_padding_lr = svg_2.clientWidth / 5;
const svg_2_padding_tb = svg_2.clientHeight / 10;
const svg_2_width = svg_2.clientWidth - svg_2_padding_lr;
const svg_2_height = svg_2.clientHeight- 2 * svg_2_padding_tb;

// Creates SVG
svg_2 = d3.select( '#svg_2' )
    .append( 'svg' )
        .attr( 'width', svg_2_width + svg_2_padding_lr)
        .attr( 'height', svg_2_height + svg_2_padding_tb)
    .append( 'g' )
        .attr( 'transform', `translate( ${ svg_2_padding_lr / 2 }, ${ svg_2_padding_tb / 5 } )` );

// Names the X axis the easier way :)
document.getElementById( 'svg_2' ).append( document.createElement( 'div' ).innerText = 'Progression of the play' );

// --------------------------------------------------
// (2.2) Updates figure 2 (polarity)
// --------------------------------------------------

function update_polarity ( data ) {
    // Finds characters to omit (i.e. that will have their curve at lower opacity)
    let inactive_characters = document.getElementById( 'polarity_characters' ).querySelectorAll( "div[inactive='1']" );
    let omitted_characters = [];

    inactive_characters.forEach( oc => {
        omitted_characters.push( oc.getAttribute( 'value' ) );
    });

    // Finds separation in acts/scenes
    const speech_amount = data.length;

    // Sorts by id
    data = data.sort( function ( a, b ) { return +a.id - +b.id } );

    // Variables used later
    let characters = [];
    let speeches_per_act = {};
    let speech_by_character = {};
    let total_acts = 0;

    // Does a lot of stuff in a single loop
    data.forEach( row => {
        // Adds to array if speaker doesn't exist
        if ( characters.indexOf( row.speaker ) == -1 ) {
            characters.push( row.speaker );
        }

        // Counts speeches per act
        if ( speeches_per_act[row.scene] > 0 ) {
            speeches_per_act[row.scene] += 1;
        } else {
            speeches_per_act[row.scene] = 1
        }
    });

    // Counts the amount of acts
    for ( act in speeches_per_act ) { total_acts++ }

    // Builds data
    characters.forEach( char => {
        speech_by_character[char] = [];
    });

    data.forEach( row => {
        speech_by_character[row.speaker].push( row.id );
    });

    // For each character, builds data
    let data_ready = []

    characters.forEach( char => {
        let values = []
        for( let i = 1 ; i <= speech_amount ; i++ ){
            if ( speech_by_character[char].indexOf( data[i-1].id ) > -1 ) {
                values.push( { time : i, value : data[ i-1 ].polarity } );
            } else {
                values.push( { time : i, value : 0 } );
            }
        }

        let avg = 0;
        let n = 0;

        // Calculates average polarity
        values.forEach( function( v ) {
            // Only taking in account non-null values
            // because null values are mostly irrelevant
            if ( v.value ) {
                n+= 1;
                avg += v.value;
            }
        })
        avg = ( avg / n ).toFixed(3);

        data_ready.push( { name : char, values : values, avg : avg } );
    })

    // Creates custom color scale from hsl
    let colors = {};

    // Change to something else if wanted
    const hue_range = 360;
    const hue_shift = -20;

    const character_length = characters.length;
    for( let i = 0 ; i < character_length ; i++ ) {
        let hue = Math.round( hue_range / character_length * ( i+1 ) + hue_shift , 1 );
        colors[ characters[ i ] ] = `hsl(${hue}, 75%, 50%)`;
    }

    // Creates clickable div for dynamic display
    let polarity_characters = document.getElementById( 'polarity_characters' );
        polarity_characters.innerHTML = '';

    for( v in colors ){
        let div = document.createElement( 'div' );
            div.setAttribute( 'value', v );
            div.style.backgroundColor = colors[ v ];

            // Adds event listener
            div.addEventListener( 'click', function () {
                let inactive = Number( this.getAttribute( 'inactive') );
                if ( inactive == 0 ) {
                    this.setAttribute( 'inactive', '1' );
                } else {
                    this.setAttribute( 'inactive', '0' );
                }
                update_polarity( data );
            })

            // Decides wether show or not
            if ( omitted_characters.indexOf( v ) < 0 ) {
                div.setAttribute( 'inactive', '0' );
            } else {
                div.setAttribute( 'inactive', '1' );
            }

            div.innerText = v;
            polarity_characters.appendChild( div );
    }

    // Sets opacity for inactive elements (divs only, below for paths !)
    document.getElementById( 'polarity_characters' ).querySelectorAll( 'div' ).forEach( elt => {
        let inactive = Number( elt.getAttribute( 'inactive' ) );
        if ( inactive == 0 ) {
            elt.style.opacity = 1;
        } else{
            elt.style.opacity = .5;
        }
    });

    // Removes previous things to replace with new ones
    svg_2.selectAll( 'path' ).remove();
    svg_2.selectAll( 'text' ).remove();
    svg_2.selectAll( 'line' ).remove();

    // X
    let svg_2_x = d3.scaleLinear()
        .domain( [ 0, speech_amount ] )
        .range( [ 0, svg_2_width ] );

    // Y
    let svg_2_y = d3.scaleLinear()
        .domain( [-1,1])
        .range( [ svg_2_height, 0 ] );

    svg_2.append( 'g' )
        .call( d3.axisLeft( svg_2_y ) );

    // Labelling Y : Negative
    svg_2.append( 'text' )
        .attr( 'text-anchor', 'middle' )
        .attr( 'fill', 'rgba(0,255,255,.75)' )
        .attr( 'y', svg_2_height )
        .attr( 'x', -75 )
        .text( 'Negative' );

    // Labelling Y : Positive
    svg_2.append( 'text' )
        .attr( 'text-anchor', 'middle')
        .attr( 'fill', 'rgba(255,255,255,.75)')
        .attr( 'y', svg_2_height/2)
        .attr( 'x', -85)
        .text( 'Neutral');

    // Labelling Y : Neutral
    svg_2.append( 'text' )
        .attr( 'text-anchor', 'middle' )
        .attr( 'fill', 'rgba(255,255,0,.75)' )
        .attr( 'y', 0 )
        .attr( 'x', -75 )
        .text( 'Positive' );

    // Adds lines
    let line = d3.line()
        .curve( d3.curveBasis )
        .x( d => svg_2_x( +d.time ) )
        .y( d => svg_2_y( +d.value ) )

    // Updates information when mouse over
    function update_info ( e, d ) {
        let pol;

        // Defines polarity based on average value
        if ( d.avg > 0 ) {
            if ( d.avg >= .5 ) {
                pol = 'Very positive';
            }
            else{
                pol = 'Positive';
            }
        }
        else if ( d.avg < 0 ) {
            if ( d.avg <= -.5 ) {
                pol = 'Very negative';
            }
            else{
                pol = 'Negative';
            }
        }
        else {
            pol = 'Neutral';
        }

        document.getElementById( 'pi_char' ).innerText = 'Character : ' + d.name;
        document.getElementById( 'pi_avg' ).innerText = 'Average value : ' + d.avg;
        document.getElementById( 'pi_pol' ).innerText = 'Polarity type : ' + pol;
    }

    svg_2
        .selectAll( 'path' )
        .data( data_ready )
        .join( 'path' )
            .attr( 'class', d => d.name )
            .attr( 'd', d => line( d.values ) )
            .attr( 'stroke', d => colors[ d.name ] )
            .style( 'stroke-width', 2 )
            .style( 'fill', 'none' )
            .style( 'opacity', d => {
                // Ugly, but it works :)
                return omitted_characters.indexOf( d.name ) < 0 ? 1 : 0.25;
            })
        .on( 'mouseover', function( e, d ){ update_info(e, d); } );

    // Add separation line for each acts/scenes
    let play_position = 0;

    // Draws again line for Y axis (for some reason it gets erased?)
    svg_2.append( 'line' )
        .style( 'stroke', 'white' )
        .style( 'stroke-width', 1 )
        .attr( 'x1', 0 )
        .attr( 'y1', 0 )
        .attr( 'x2', 0 )
        .attr( 'y2', svg_2_height );

    let current_act = 1;

    for( act in speeches_per_act ) {
        let pop = speeches_per_act[act] / speech_amount;
        play_position += pop;
        let stop = play_position * svg_2_width;

        // Draws line
        svg_2.append( 'line' )
            .style( 'stroke', 'white' )
            .style( 'stroke-width', 1 )
            .attr( 'x1', stop )
            .attr( 'y1', 0 )
            .attr( 'x2', stop )
            .attr( 'y2', svg_2_height - 20 );
        
        // Adds text if not last act
        if ( current_act < total_acts ) {
            svg_2.append( 'text' )
                .attr( 'text-anchor', 'middle' )
                .attr( 'fill', 'white' )
                .attr( 'y', svg_2_height )
                .attr( 'x', stop )
                .attr( 'font-size', '.75em' )
                .text( '(act/scene change)' )
        }
        current_act++;
    }
}

// --------------------------------------------------
// (3.1) Creation of the personnality figure
// --------------------------------------------------

// Relative dimensions of the figure 3
let svg_3 = document.getElementById( 'svg_3' );
const svg_3_padding = svg_3.clientWidth / 5;
const svg_3_side = svg_3.clientHeight / 1.25;

// Creates SVG
svg_3 = d3.select( '#svg_3' )
    .append( 'svg' )
        .attr( 'width', svg_3_side + svg_3_padding )
        .attr( 'height', svg_3_side + svg_3_padding )
    .append( 'g' )
        .attr( 'transform', `translate( ${ svg_3_padding / 2 }, ${ svg_3_padding / 5 } )` );

// X
let svg_3_x = d3.scaleLinear()
    .domain( [ -1, 1 ] )
    .range( [ 0, svg_3_side ] );
    svg_3.append( 'g' )
        .attr( 'transform', 'translate(0,' + svg_3_side + ')' )
        .call( d3.axisBottom( svg_3_x ) );

// Y
let svg_3_y = d3.scaleLinear()
    .domain( [ -1, 1 ] )
    .range( [ svg_3_side, 0 ] );
    svg_3.append( 'g' )
        .call( d3.axisLeft( svg_3_y ) );

// Adds lines for better readability
svg_3.append( 'line' )
    .style( 'stroke', 'white' )
    .style( 'stroke-width', 1 )
    .attr( 'x1', svg_3_side / 2 )
    .attr( 'y1', 0)
    .attr( 'x2', svg_3_side / 2 )
    .attr( 'y2', svg_3_side )
    .attr( 'opacity', .25 );

svg_3.append( 'line' )
    .style( 'stroke', 'white' )
    .style( 'stroke-width', 1 )
    .attr( 'x1', 0 )
    .attr( 'y1', svg_3_side / 2 )
    .attr( 'x2', svg_3_side )
    .attr( 'y2', svg_3_side / 2 )
    .attr( 'opacity', .25 );

svg_3.append( 'line' )
    .style( 'stroke', 'white' )
    .style( 'stroke-width', 1 )
    .attr( 'x1', svg_3_side )
    .attr( 'y1', svg_3_side )
    .attr( 'x2', svg_3_side )
    .attr( 'y2', 0 );

svg_3.append( 'line' )
    .style( 'stroke', 'white' )
    .style( 'stroke-width', 1 )
    .attr( 'x1', 0 )
    .attr( 'y1', 0 )
    .attr( 'x2', svg_3_side )
    .attr( 'y2', 0 );

// --------------------------------------------------
// (3.2) Updates figure 3 (personnality)
// --------------------------------------------------

function update_personnality ( data ) {
    // Gets omitted characters
    let inactive_characters = document.getElementById( 'others_characters' ).querySelectorAll( "div[inactive='1']" );
    let omitted_characters = [];
    inactive_characters.forEach( oc => {
        omitted_characters.push( oc.getAttribute( 'value' ) )
    });

    // Finds all characters
    let characters = [];

    data.forEach( row => {
        if ( characters.indexOf( row.speaker ) == -1 ) {
            characters.push( row.speaker );
        }
    })

    // Creates custom color scale from hsl
    let colors = [];

    // Change to something else if wanted
    const hue_range = 360;
    const hue_shift = -20;

    const character_length = characters.length;
    for ( let i = 0 ; i < character_length ; i++ ) {
        let hue = Math.round( hue_range / character_length * ( i+1 ) + hue_shift , 1 );
        colors.push( `hsl(${hue}, 75%, 50%)` ); 
    }

    // Creates clickable div for dynamic display
    let others_characters = document.getElementById( 'others_characters' );
        others_characters.innerHTML = '';

    for ( let i = 0 ; i < characters.length ; i++ ) {
        let div = document.createElement( 'div' );
            div.setAttribute( 'value', characters[i] );
            div.style.backgroundColor = colors[i];

            // Adds event listener
            div.addEventListener( 'click', function () {
                let inactive = Number( this.getAttribute( 'inactive' ) );
                if ( inactive == 0 ) {
                    this.setAttribute( 'inactive', '1' );
                } else{
                    this.setAttribute( 'inactive', '0' );
                }
                update_personnality(data);
            })

            // Decides wether show or not
            if ( omitted_characters.indexOf( characters[i] ) < 0 ) {
                div.setAttribute( 'inactive', '0' );
            } else {
                div.setAttribute( 'inactive', '1' );
            }

            div.innerText = characters[i];
            others_characters.appendChild( div );
    }

    // Sets opacity for inactive elements (divs only, below for paths !)
    document.getElementById( 'others_characters' ).querySelectorAll( 'div' ).forEach( elt => {
        let inactive = Number( elt.getAttribute( 'inactive' ) );
        if ( inactive == 0 ) {
            elt.style.opacity = 1;
        } else {
            elt.style.opacity = .5;
        }
    });

    // Gets variables to use for the plot
    let variable_x = personnality_aspects[ document.getElementById( 'x_axis' ).getAttribute( 'value' ) ];
    let variable_y = personnality_aspects[ document.getElementById( 'y_axis' ).getAttribute( 'value' ) ];

    // Reformatts data
    let new_data = {};

    characters.forEach(char  => {
        new_data[char] = { introspection : [], attitude : [], temper : [], sensitivity : [] };
    });

    // Adds needed data to the arrays
    data.forEach( row => {
        let v_x = row[variable_x];
        let v_y = row[variable_y];
        if ( v_x != 0 ) { new_data[row.speaker][variable_x].push( v_x ); }
        if ( v_y != 0 ) { new_data[row.speaker][variable_y].push( v_y ); }
    });

    // Calculates average
    let data_final = [];

    for( d in new_data ){
        let v_x = new_data[d][variable_x];
        let v_y = new_data[d][variable_y];

        let sum_x = 0;
        let sum_y = 0;

        if ( v_x.length > 0 ) {
            sum_x = d3.sum( v_x ) / v_x.length;
        }
        if (v_y.length > 0) {
            sum_y = d3.sum( v_y ) / v_y.length;
        }

        let char_object = { speaker : d, introspection : 0, attitude : 0, temper : 0, sensitivity : 0 };
            char_object[variable_x] = sum_x;
            char_object[variable_y] = sum_y;

        data_final.push( char_object );
    }

    // Colors
    const color = d3.scaleOrdinal()
        .domain( characters )
        .range( colors );

    // Removes previous dots from figure
    svg_3.selectAll( 'dot' ).remove();
    svg_3.selectAll( 'circle' ).remove();
    svg_3.selectAll( 'text' ).remove();

    // X
    let svg_3_x = d3.scaleLinear()
        .domain( [ -1, 1 ] )
        .range( [ 0, svg_3_side ] );
        svg_3.append( 'g' )
            .attr( 'transform', 'translate(0,' + svg_3_side + ')' )
            .call( d3.axisBottom( svg_3_x ) );

    // Names axis
    svg_3.append( 'text' )
        .attr( 'text-anchor', 'middle' )
        .attr( 'fill', 'white' )
        .attr( 'y', svg_3_side + 35 )
        .attr( 'x', svg_3_side / 2 )
        .text( variable_x );

    // Y
    let svg_3_y = d3.scaleLinear()
        .domain( [ -1, 1 ] )
        .range( [ svg_3_side, 0 ] );
        svg_3.append( 'g' )
            .call( d3.axisLeft( svg_3_y ) );

    // Names axis
    svg_3.append( 'text' )
        .attr( 'text-anchor', 'middle' )
        .attr( 'transform', 'rotate(-90)' )
        .attr( 'fill', 'white' )
        .attr( 'y', -35 )
        .attr( 'x', - svg_3_side / 2 )
        .text( variable_y );

    // Tooltip
    const Tooltip = d3.select( '#svg_3' )
        .append( 'div' )
        .style( 'opacity', 0 )
        .attr( 'class', 'tooltip' )
        .style( 'background-color', '#333' )
        .style( 'border-radius', '.25em' )
        .style( 'padding', '.5em' )
        .style( 'position', 'absolute' );

    // Tooltip's functions
    function tooltip_hover ( e, d ) {
        Tooltip.style( 'opacity', 1 );
        Tooltip.style( 'background-color', color( d.speaker ) );
    }
    function tooltip_move ( e, d ) {
        let text =  d.speaker  +
                    "<br>Introspection : " + Number( ( d.introspection ).toFixed( 3 ) ) +
                    "<br>Temper : " + Number( ( d.temper ).toFixed( 3 ) ) +
                    "<br>Attitude : " + Number( ( d.attitude ).toFixed( 3 ) ) +
                    "<br>Sensitivity : " + Number( ( d.sensitivity ).toFixed( 3 ) )

        Tooltip.html(text);
        Tooltip.style( 'left', `${e.layerX+20}px` );
        Tooltip.style( 'top', `${e.layerY-20}px` );
    }
    function tooltip_leave ( e ) {
        Tooltip.style( 'opacity', 0 );
    }

    // Add dots
    svg_3.append( 'g' )
        .selectAll( 'dot' )
        .data( data_final )
        .join( 'circle' )
            .attr( 'cx', function ( d ) { return svg_3_x( d[variable_x] ); } )
            .attr( 'cy', function ( d ) { return svg_3_y( d[variable_y] ); } )
            .attr( 'r', 10)
            .style( 'fill', function ( d ) { return color( d.speaker ) } )
            .style( 'opacity', d => {
                // Ugly, but it works :)
                return omitted_characters.indexOf( d.speaker ) < 0 ? 1 : 0.25;
            })
        .on( 'mouseover', tooltip_hover )
        .on( 'mousemove', tooltip_move )
        .on( 'mouseleave', tooltip_leave );
}

// --------------------------------------------------
// Loads data from csv (async) and plots figures
// --------------------------------------------------

async function main ( play ) {
    try {
        // Removes black screen if needed
        document.body.removeChild( document.getElementById( 'black' ) );
    }
    catch ( error ) { }

    try {
        data = await load_data( play );
    }
    catch ( error ) {
        // Recreates black screen
        let black = document.createElement( 'div' );
            black.setAttribute( 'id', 'black' );
            black.innerText = 'Please provide a valid .csv file!'
        document.body.appendChild( black );

        return;
    }

    // Plots figure 1.1
    bar_plot_amount( data );

    // Resets values for figure 1.2
    document.getElementById( 'vi2_type').setAttribute( 'value', 0 );
    document.getElementById( 'vi2_type').innerText = 'Whole play';
    document.getElementById( 'vi2_scale').setAttribute( 'value', 0 );
    document.getElementById( 'vi2_scale').innerText = 'Absolute (count)';

    // Initial run of figure 1.2
    update_bar_plot_emotions( data, false, false );

    // Initial run of figure 2
    update_polarity( data );

    // Initial run for figure 3
    update_personnality( data );

    // Resets buttons for figure 3
    document.getElementById( 'x_axis' ).setAttribute( 'value', 0 );
    document.getElementById( 'x_axis' ).innerText = 'Introspection';
    document.getElementById( 'y_axis' ).setAttribute( 'value', 1 );
    document.getElementById( 'y_axis' ).innerText = 'Temper';

    // Handles looping through personnality aspects
    [ document.getElementById( 'x_axis' ), document.getElementById( 'y_axis' ) ].forEach( elt => {
        elt.addEventListener( 'click', function () {
            let new_value = ( Number( elt.getAttribute( 'value' ) ) + 1 ) % 4;

            // Sets new value
            elt.setAttribute( 'value', new_value );
            elt.innerText = personnality_aspects[new_value].charAt(0).toUpperCase() + personnality_aspects[new_value].slice(1);

            // Calls plotting function
            update_personnality( data );
        })
    });
}

// --------------------------------------------------
// Loads example csv
// --------------------------------------------------

document.getElementById( 'example' ).addEventListener( 'click', function () {
    let play_path = 'data/The Devil - Exported.csv'
    main( play_path );
});

// --------------------------------------------------
// Handles new plays with custom paths
// --------------------------------------------------

document.getElementById( 'load_play_input' ).addEventListener( 'change', function () {
    let play_path = 'data/' + this.files[0].name;
    main( play_path );
});

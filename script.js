//Read the data
d3.csv("data/team_data.csv", function(data) {

    // function to activate when team selector is changed
    document.getElementById("teamSelector").onchange = function(){

        var circles = d3.selectAll('circle');
        
        // reset opacity and ability to trigger tooltip
        circles.style('opacity', 1);
        circles.attr('pointer-events', 'auto');

        if (document.getElementById("teamSelector").value == 'All'){
            return // nothing else needed
        }

        // otherwise, lower opacity of 'out of group' characters

        // select row corresponding to selected team
        var filtered_data = data.filter(function(c){return c.Team == document.getElementById("teamSelector").value});
        
        // get list of this team's members (IDs)
        var member_ids = filtered_data[0].team_members_ids;

        // list is read as string. Convert to array.
        member_ids = (JSON.parse("[" + member_ids + "]"))[0];

        // select circles with ID *not* in member_ids list and lower opacity
        circles.filter(function(d){return !member_ids.includes(Number(d.pic_id))}).style('opacity', 0.1);
        // and disable tooltip
        circles.filter(function(d){return !member_ids.includes(Number(d.pic_id))}).attr('pointer-events', "none");

        // select circles with ID *in* member_ids list and raise their placement
        circles.filter(function(d){return member_ids.includes(Number(d.pic_id))}).raise();
    };

});

// var footnote1 = document.getElementById("footnote1");
// footnote1.onclick = function() {
//     currentStyle = document.getElementById("footnote1Text").style.display;
//     document.getElementById("footnote1Text").style.display = (currentStyle === 'block') ? 'none' : 'block';

//     currentText = footnote1.innerHTML;
//     footnote1.innerHTML = (currentText === 'x') ? '1' : 'x';
// };
// document.getElementById("footnote1Text").onclick = function() {
//     this.style.display = 'none';
//     document.getElementById("footnote1").innerHTML = "1";
// };

// var footnote2 = document.getElementById("footnote2");
// footnote2.onclick = function() {
//     currentStyle = document.getElementById("footnote2Text").style.display;
//     document.getElementById("footnote2Text").style.display = (currentStyle === 'block') ? 'none' : 'block';

//     currentText = footnote2.innerHTML;
//     footnote2.innerHTML = (currentText === 'x') ? '2' : 'x';
// };
// document.getElementById("footnote2Text").onclick = function() {
//     this.style.display = 'none';
//     document.getElementById("footnote2").innerHTML = "2";
// };

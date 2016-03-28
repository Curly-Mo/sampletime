define(function (require, exports, module) {
    module.exports = {
       hcluster: require("./hcluster"),
       Kmeans: require("./kmeans"),
       kmeans: require("./kmeans").kmeans,
       distance: require("./distance"),
    };
});

{
    "arm": 0,
    "holding": null,
    "objects": {
        "a": {
            "color": "green",
            "form": "brick",
            "size": "large"
        },
        "b": {
            "color": "white",
            "form": "brick",
            "size": "small"
        },
        "c": {
            "color": "red",
            "form": "plank",
            "size": "large"
        },
        "d": {
            "color": "green",
            "form": "plank",
            "size": "small"
        },
        "e": {
            "color": "white",
            "form": "ball",
            "size": "large"
        },
        "f": {
            "color": "black",
            "form": "ball",
            "size": "small"
        },
        "g": {
            "color": "blue",
            "form": "table",
            "size": "large"
        },
        "h": {
            "color": "red",
            "form": "table",
            "size": "small"
        },
        "i": {
            "color": "yellow",
            "form": "pyramid",
            "size": "large"
        },
        "j": {
            "color": "red",
            "form": "pyramid",
            "size": "small"
        },
        "k": {
            "color": "yellow",
            "form": "box",
            "size": "large"
        },
        "l": {
            "color": "red",
            "form": "box",
            "size": "large"
        },
        "m": {
            "color": "blue",
            "form": "box",
            "size": "small"
        }
    },
    "parses": [
        {
            "input": "put the black ball in a box on the floor",
            "prs": {
                "cmd": "move",
                "ent": {
                    "obj": {
                        "loc": {
                            "ent": {
                                "obj": {
                                    "color": null,
                                    "form": "box",
                                    "size": null
                                },
                                "quant": "any"
                            },
                            "rel": "inside"
                        },
                        "obj": {
                            "color": "black",
                            "form": "ball",
                            "size": null
                        }
                    },
                    "quant": "the"
                },
                "loc": {
                    "ent": {
                        "obj": {
                            "color": null,
                            "form": "floor",
                            "size": null
                        },
                        "quant": "the"
                    },
                    "rel": "ontop"
                }
            }
        },
        {
            "input": "put the black ball in a box on the floor",
            "prs": {
                "cmd": "move",
                "ent": {
                    "obj": {
                        "color": "black",
                        "form": "ball",
                        "size": null
                    },
                    "quant": "the"
                },
                "loc": {
                    "ent": {
                        "obj": {
                            "loc": {
                                "ent": {
                                    "obj": {
                                        "color": null,
                                        "form": "floor",
                                        "size": null
                                    },
                                    "quant": "the"
                                },
                                "rel": "ontop"
                            },
                            "obj": {
                                "color": null,
                                "form": "box",
                                "size": null
                            }
                        },
                        "quant": "any"
                    },
                    "rel": "inside"
                }
            }
        }
    ],
    "stacks": [
        [
            "e"
        ],
        [
            "g",
            "l"
        ],
        [],
        [
            "k",
            "m",
            "f"
        ],
        []
    ],
    "utterance": "put the black ball in a box on the floor"
}

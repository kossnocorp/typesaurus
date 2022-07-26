import type { TypesaurusUtils } from '.'

namespace AllRequired {
  type Result1 = Assert<
    {
      required: string
      optional: string
    },
    TypesaurusUtils.AllRequired<{
      required: string
      optional?: string
    }>
  >

  type Result2 = Assert<
    {
      required: string
      optional: string
    },
    TypesaurusUtils.AllRequired<{
      required: string
      optional?: string | undefined
    }>
  >
}

namespace RequiredKey {
  interface Example {
    required: string
    optional?: string
  }

  type Result1 = Assert<true, TypesaurusUtils.RequiredKey<Example, 'required'>>

  type Result2 = Assert<false, TypesaurusUtils.RequiredKey<Example, 'optional'>>
}

namespace AllOptionalBut {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<
    true,
    TypesaurusUtils.AllOptionalBut<Example1, 'required'>
  >

  type Result2 = Assert<
    false,
    TypesaurusUtils.AllOptionalBut<Example1, 'optional'>
  >

  interface Example2 {
    required1: string
    required2: string
    optional?: string
  }

  type Result3 = Assert<
    false,
    TypesaurusUtils.AllOptionalBut<Example2, 'required1'>
  >

  type Result4 = Assert<
    false,
    TypesaurusUtils.AllOptionalBut<Example2, 'required2'>
  >

  type Result5 = Assert<
    false,
    TypesaurusUtils.AllOptionalBut<Example2, 'optional'>
  >

  interface Example3 {
    [postId: string]:
      | undefined
      | {
          likes?: string
          views?: string
        }
  }

  type Result6 = Assert<
    true,
    TypesaurusUtils.AllOptionalBut<Example3, 'post-id'>
  >

  interface Example4 {
    required: string
    [optional: string]: undefined | string
  }

  type Result7 = Assert<
    true,
    TypesaurusUtils.AllOptionalBut<Example4, 'required'>
  >
}

namespace RequiredPath {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<
    true,
    TypesaurusUtils.RequiredPath1<Example1, 'required'>
  >

  type Result2 = Assert<
    true,
    TypesaurusUtils.RequiredPath1<Example1, 'optional'>
  >

  type Result3 = Assert<
    true,
    TypesaurusUtils.RequiredPath1<
      {
        required1: string
        required2: string
        optional?: string
      },
      'required1'
    >
  >

  interface Example2 {
    required: {
      required: string
      optional?: string
    }
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result4 = Assert<
    true,
    TypesaurusUtils.RequiredPath2<Example2, 'required', 'required'>
  >

  type Result5 = Assert<
    true,
    TypesaurusUtils.RequiredPath2<Example2, 'required', 'optional'>
  >

  type Result6 = Assert<
    false,
    TypesaurusUtils.RequiredPath2<Example2, 'optional', 'required'>
  >

  type Result7 = Assert<
    false,
    TypesaurusUtils.RequiredPath2<Example2, 'optional', 'optional'>
  >

  interface Example3 {
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result8 = Assert<
    false,
    TypesaurusUtils.RequiredPath2<Example3, 'optional', 'required'>
  >

  type Result9 = Assert<
    false,
    TypesaurusUtils.RequiredPath2<Example3, 'optional', 'optional'>
  >

  interface Example4 {
    required: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
    optional?: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
  }

  type Result10 = Assert<
    true,
    TypesaurusUtils.RequiredPath3<Example4, 'required', 'required', 'required'>
  >

  type Result11 = Assert<
    true,
    TypesaurusUtils.RequiredPath3<Example4, 'required', 'required', 'optional'>
  >

  type Result12 = Assert<
    false,
    TypesaurusUtils.RequiredPath3<Example4, 'required', 'optional', 'required'>
  >

  type Result13 = Assert<
    false,
    TypesaurusUtils.RequiredPath3<Example4, 'required', 'optional', 'optional'>
  >

  type Result14 = Assert<
    false,
    TypesaurusUtils.RequiredPath3<Example4, 'optional', 'required', 'required'>
  >

  type Result15 = Assert<
    false,
    TypesaurusUtils.RequiredPath3<Example4, 'optional', 'required', 'optional'>
  >

  type Result16 = Assert<
    false,
    TypesaurusUtils.RequiredPath3<Example4, 'optional', 'optional', 'required'>
  >

  type Result17 = Assert<
    false,
    TypesaurusUtils.RequiredPath3<Example4, 'optional', 'optional', 'optional'>
  >

  interface Example5 {
    1: {
      2: {
        3: {
          4: true
        }
        optional?: {
          4: true
        }
      }
    }
  }

  type Result18 = Assert<
    true,
    TypesaurusUtils.RequiredPath4<Example5, 1, 2, 3, 4>
  >

  type Result19 = Assert<
    false,
    TypesaurusUtils.RequiredPath4<Example5, 1, 2, 'optional', 4>
  >

  interface Example6 {
    1: {
      2: {
        3: {
          4: {
            5: true
          }
          optional?: {
            5: true
          }
        }
      }
    }
  }

  type Result20 = Assert<
    true,
    TypesaurusUtils.RequiredPath5<Example6, 1, 2, 3, 4, 5>
  >

  type Result21 = Assert<
    false,
    TypesaurusUtils.RequiredPath5<Example6, 1, 2, 3, 'optional', 5>
  >
}

namespace SafeOptionalPath {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<
    true,
    TypesaurusUtils.SafeOptionalPath1<Example1, 'required'>
  >

  type Result2 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath1<Example1, 'optional'>
  >

  type Result3 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath1<
      {
        required1: string
        required2: string
        optional?: string
      },
      'required1'
    >
  >

  interface Example2 {
    required: {
      required: string
      optional?: string
    }
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result4 = Assert<
    true,
    TypesaurusUtils.SafeOptionalPath2<Example2, 'required', 'required'>
  >

  type Result5 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath2<Example2, 'required', 'optional'>
  >

  type Result6 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath2<Example2, 'optional', 'required'>
  >

  type Result7 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath2<Example2, 'optional', 'optional'>
  >

  interface Example3 {
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result8 = Assert<
    true,
    TypesaurusUtils.SafeOptionalPath2<Example3, 'optional', 'required'>
  >

  type Result9 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath2<Example3, 'optional', 'optional'>
  >

  interface Example4 {
    required: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
    optional?: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
  }

  type Result10 = Assert<
    true,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'required',
      'required',
      'required'
    >
  >

  type Result11 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'required',
      'required',
      'optional'
    >
  >

  type Result12 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'required',
      'optional',
      'required'
    >
  >

  type Result13 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'required',
      'optional',
      'optional'
    >
  >

  type Result14 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'optional',
      'required',
      'required'
    >
  >

  type Result15 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'optional',
      'required',
      'optional'
    >
  >

  type Result16 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'optional',
      'optional',
      'required'
    >
  >

  type Result17 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'optional',
      'optional',
      'optional'
    >
  >

  interface Example5 {
    optional?: {
      optional?: {
        required: string
        optional?: string
      }
    }
  }

  type Result18 = Assert<
    true,
    TypesaurusUtils.SafeOptionalPath3<
      Example5,
      'optional',
      'optional',
      'required'
    >
  >

  type Result19 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example5,
      'optional',
      'optional',
      'optional'
    >
  >
}

namespace SafePath {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<true, TypesaurusUtils.SafePath1<Example1, 'required'>>

  type Result2 = Assert<true, TypesaurusUtils.SafePath1<Example1, 'optional'>>

  type Result3 = Assert<
    true,
    TypesaurusUtils.SafePath1<
      {
        required1: string
        required2: string
        optional?: string
      },
      'required1'
    >
  >

  interface Example2 {
    required: {
      required: string
      optional?: string
    }
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result4 = Assert<
    true,
    TypesaurusUtils.SafePath2<Example2, 'required', 'required'>
  >

  type Result5 = Assert<
    true,
    TypesaurusUtils.SafePath2<Example2, 'required', 'optional'>
  >

  type Result6 = Assert<
    true,
    TypesaurusUtils.SafePath2<Example2, 'optional', 'required'>
  >

  type Result7 = Assert<
    false,
    TypesaurusUtils.SafePath2<Example2, 'optional', 'optional'>
  >

  interface Example3 {
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result8 = Assert<
    true,
    TypesaurusUtils.SafePath2<Example3, 'optional', 'required'>
  >

  type Result9 = Assert<
    false,
    TypesaurusUtils.SafePath2<Example3, 'optional', 'optional'>
  >

  interface Example4 {
    [postId: string]:
      | undefined
      | {
          likes?: number
          views?: number
        }
  }

  type Result10 = Assert<
    true,
    TypesaurusUtils.SafePath2<Example4, 'post-id', 'likes'>
  >

  interface Example5 {
    required: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
    optional?: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
  }

  type Result11 = Assert<
    true,
    TypesaurusUtils.SafePath3<Example5, 'required', 'required', 'required'>
  >

  type Result12 = Assert<
    true,
    TypesaurusUtils.SafePath3<Example5, 'required', 'required', 'optional'>
  >

  type Result13 = Assert<
    true,
    TypesaurusUtils.SafePath3<Example5, 'required', 'optional', 'required'>
  >

  type Result14 = Assert<
    false,
    TypesaurusUtils.SafePath3<Example5, 'required', 'optional', 'optional'>
  >

  type Result15 = Assert<
    true,
    TypesaurusUtils.SafePath3<Example5, 'optional', 'required', 'required'>
  >

  type Result16 = Assert<
    false,
    TypesaurusUtils.SafePath3<Example5, 'optional', 'required', 'optional'>
  >

  type Result17 = Assert<
    false,
    TypesaurusUtils.SafePath3<Example5, 'optional', 'optional', 'required'>
  >

  type Result18 = Assert<
    false,
    TypesaurusUtils.SafePath3<Example5, 'optional', 'optional', 'optional'>
  >

  interface Example6 {
    stats?: {
      [postId: string]:
        | undefined
        | {
            likes?: number
            views?: number
          }
    }
  }

  type Result19 = Assert<
    true,
    TypesaurusUtils.SafePath3<Example6, 'stats', 'post-id', 'likes'>
  >

  interface Example7 {
    1: {
      2: {
        3: {
          required: string
          optional?: string
        }
      }
    }

    one?: {
      2: {
        3: {
          required: string
          optional?: string
        }
      }
    }

    uno?: {
      dos: string
      2: {
        3: {
          required: string
          optional?: string
        }
      }
    }
  }

  type Result20 = Assert<
    true,
    TypesaurusUtils.SafePath4<Example7, 1, 2, 3, 'required'>
  >

  type Result21 = Assert<
    true,
    TypesaurusUtils.SafePath4<Example7, 1, 2, 3, 'optional'>
  >

  type Result22 = Assert<
    true,
    TypesaurusUtils.SafePath4<Example7, 'one', 2, 3, 'required'>
  >

  type Result23 = Assert<
    false,
    TypesaurusUtils.SafePath4<Example7, 'one', 2, 3, 'optional'>
  >

  type Result24 = Assert<
    false,
    TypesaurusUtils.SafePath4<Example7, 'uno', 2, 3, 'required'>
  >

  type Result25 = Assert<
    false,
    TypesaurusUtils.SafePath4<Example7, 'uno', 2, 3, 'optional'>
  >

  interface Example8 {
    stats?: {
      [postId: string]:
        | undefined
        | {
            [commentId: string]:
              | undefined
              | {
                  likes?: number
                  views?: number
                }
          }
    }
  }

  type Result26 = Assert<
    true,
    TypesaurusUtils.SafePath4<
      Example8,
      'stats',
      'post-id',
      'comment-id',
      'likes'
    >
  >

  /*
  interface Example6 {
    1: {
      2: {
        3: {
          4: {
            required: string
            optional?: string
          }
        }
      }
    }
  }

  type Result18 = Assert<
    true,
    TypesaurusUtils.SafePath5<Example6, 1, 2, 3, 4, 'required'>
  >

  type Result19 = Assert<
    false,
    TypesaurusUtils.SafePath5<Example6, 1, 2, 3, 4, 'optional'>
  >

  interface Example7 {
    1: {
      2: {
        3: {
          4: {
            5: {
              required: string
              optional?: string
            }
          }
        }
      }
    }
  }

  type Result20 = Assert<
    true,
    TypesaurusUtils.SafePath6<Example7, 1, 2, 3, 4, 5, 'required'>
  >

  type Result21 = Assert<
    false,
    TypesaurusUtils.SafePath6<Example7, 1, 2, 3, 4, 5, 'optional'>
  >

  interface Example8 {
    1: {
      2: {
        3: {
          4: {
            5: {
              6: {
                required: string
                optional?: string
              }
            }
          }
        }
      }
    }
  }

  type Result22 = Assert<
    true,
    TypesaurusUtils.SafePath7<Example8, 1, 2, 3, 4, 5, 6, 'required'>
  >

  type Result23 = Assert<
    false,
    TypesaurusUtils.SafePath7<Example8, 1, 2, 3, 4, 5, 6, 'optional'>
  >

  interface Example9 {
    1: {
      2: {
        3: {
          4: {
            5: {
              6: {
                7: {
                  required: string
                  optional?: string
                }
              }
            }
          }
        }
      }
    }
  }

  type Result24 = Assert<
    true,
    TypesaurusUtils.SafePath8<Example9, 1, 2, 3, 4, 5, 6, 7, 'required'>
  >

  type Result25 = Assert<
    false,
    TypesaurusUtils.SafePath8<Example9, 1, 2, 3, 4, 5, 6, 7, 'optional'>
  >

  interface Example10 {
    1: {
      2: {
        3: {
          4: {
            5: {
              6: {
                7: {
                  8: {
                    required: string
                    optional?: string
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  type Result26 = Assert<
    true,
    TypesaurusUtils.SafePath9<Example10, 1, 2, 3, 4, 5, 6, 7, 8, 'required'>
  >

  type Result27 = Assert<
    false,
    TypesaurusUtils.SafePath9<Example10, 1, 2, 3, 4, 5, 6, 7, 8, 'optional'>
  >

  interface Example11 {
    1: {
      2: {
        3: {
          4: {
            5: {
              6: {
                7: {
                  8: {
                    9: {
                      required: string
                      optional?: string
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  type Result28 = Assert<
    true,
    TypesaurusUtils.SafePath10<Example11, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'required'>
  >

  type Result29 = Assert<
    false,
    TypesaurusUtils.SafePath10<Example11, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'optional'>
  > */
}

type Assert<Type1, _Type2 extends Type1> = true

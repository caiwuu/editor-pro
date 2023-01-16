/*
 * @Author: caiwu
 * @Description:
 * @CreateDate:
 * @LastEditor:
 * @LastEditTime: 2022-11-22 16:32:36
 */
// 数据结构说明 path 包含 data和formats；marks 是一个path组成的列表
export const mockData = {
  data: {
    marks: [
      {
        data: {
          marks: [
            {
              data: {
                marks: [
                  {
                    data: '多光标支持：按住Alt键 点击',
                    formats: { color: 'red', bold: true },
                  },
                ],
              },
              formats: { paragraph: true },
            },
            { data: '111', formats: { color: 'red' } },
            { data: '222', formats: { del: true, color: 'green' } },
            {
              data: {
                marks: [
                  {
                    data: '36px',
                    formats: { color: 'green', fontSize: '36px' },
                  },
                  {
                    data: '12px',
                    formats: { color: 'red', fontSize: '12px' },
                  },
                ],
              },
              formats: { paragraph: true },
            },
            {
              data: {
                marks: [
                  {
                    data: {
                      src: 'https://img2.baidu.com/it/u=3979034437,2878656671&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=333',
                      alt: 'test image',
                      width: '60px',
                      height: '60px',
                    },
                    formats: { image: true },
                  },
                  {
                    data: {
                      src: 'https://img2.baidu.com/it/u=3979034437,2878656671&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=333',
                      alt: 'test image',
                      width: '50px',
                      height: '50px',
                    },
                    formats: { image: true },
                  },
                ],
              },
              formats: { paragraph: true },
            },
            {
              data: {
                marks: [
                  {
                    data: 'this is Paragraph',
                    formats: { color: 'green' },
                  },
                ],
              },
              formats: { paragraph: true },
            },
            {
              data: 'world',
              formats: { del: true, color: 'red' },
            },
            { data: 'eee', formats: { del: true, color: 'green' } },
            {
              data: 'hhhha',
              formats: { sup: true, del: true, color: 'green', fontSize: '12px' },
            },
            { data: 'qqq', formats: { color: 'green' } },
            {
              data: '分词器',
              formats: { color: 'green' },
            },
            {
              data: {
                marks: [
                  { data: 'qqq', formats: { color: 'green' } },
                  { data: 'www', formats: { color: 'red' } },
                ],
              },
              formats: { paragraph: true },
            },
            {
              data: {
                marks: [
                  {
                    data: {
                      marks: [
                        {
                          data: {
                            marks: [
                              {
                                data: '1111',
                                formats: { color: 'red', bold: true },
                              },
                              {
                                data: '333',
                                formats: { del: true, color: 'red', fontSize: '22px' },
                              },
                            ],
                          },
                          formats: { col: true },
                        },
                        {
                          data: {
                            marks: [
                              {
                                data: '1111',
                                formats: { color: 'green' },
                              },
                            ],
                          },
                          formats: { col: true },
                        },
                      ],
                    },
                    formats: { row: true },
                  },
                ],
              },
              formats: {
                table: true,
              },
            },
          ],
        },
        formats: { root: true },
      },
    ],
  },
}
